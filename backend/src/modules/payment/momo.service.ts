import crypto from 'crypto';
import axios from 'axios';
import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// MoMo Sandbox Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:4000/api/v1/payment/momo/ipn',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/tracking',
};

interface MoMoCreateResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  qrCodeUrl?: string;
  deeplink?: string;
}

interface MoMoIPNData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

/**
 * Create MoMo payment request
 */
export async function createMoMoPayment(orderId: string): Promise<MoMoCreateResponse> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { tableSession: { include: { table: true } } }
  });

  if (!order) throw new Error('Order not found');
  if (order.totalAmount <= 0) throw new Error('Order amount must be greater than 0');

  const amount = Math.round(order.totalAmount);
  const requestId = `${orderId}_${Date.now()}`;
  const orderInfo = `Smart Restaurant - ${order.tableSession?.table?.name || 'Table'} - #${orderId.slice(-6)}`;
  const requestType = 'captureWallet';
  const extraData = Buffer.from(JSON.stringify({ orderId })).toString('base64');
  
  // Use a unique orderId for MoMo to avoid "Duplicate OrderId" error
  const momoOrderId = `${orderId}_${Date.now()}`;

  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
    `orderId=${momoOrderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${MOMO_CONFIG.partnerCode}`,
    `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join('&');

  const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode: MOMO_CONFIG.partnerCode,
    accessKey: MOMO_CONFIG.accessKey,
    requestId,
    amount,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl: MOMO_CONFIG.redirectUrl,
    ipnUrl: MOMO_CONFIG.ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi',
  };

  console.log('🔵 MoMo Request:', JSON.stringify(requestBody, null, 2));

  const response = await axios.post<MoMoCreateResponse>(MOMO_CONFIG.endpoint, requestBody);
  console.log('🟢 MoMo Response:', JSON.stringify(response.data, null, 2));

  if (response.data.resultCode !== 0) {
    throw new Error(`MoMo Error: ${response.data.message}`);
  }

  await prisma.payment.upsert({
    where: { orderId },
    update: { method: PaymentMethod.MOMO, status: PaymentStatus.PENDING },
    create: { orderId, amount, method: PaymentMethod.MOMO, status: PaymentStatus.PENDING },
  });

  return response.data;
}

/**
 * Verify MoMo IPN signature
 */
export function verifyMoMoIPN(data: MoMoIPNData): boolean {
  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${data.amount}`,
    `extraData=${data.extraData}`,
    `message=${data.message}`,
    `orderId=${data.orderId}`,
    `orderInfo=${data.orderInfo}`,
    `orderType=${data.orderType}`,
    `partnerCode=${data.partnerCode}`,
    `payType=${data.payType}`,
    `requestId=${data.requestId}`,
    `responseTime=${data.responseTime}`,
    `resultCode=${data.resultCode}`,
    `transId=${data.transId}`,
  ].join('&');

  const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');
  return signature === data.signature;
}

/**
 * Process successful MoMo payment
 */
export async function processMoMoSuccess(data: MoMoIPNData): Promise<boolean> {
  // Decode extraData to retrieve original orderId
  let realOrderId = data.orderId;
  try {
    const decodedExtra = JSON.parse(Buffer.from(data.extraData, 'base64').toString());
    if (decodedExtra.orderId) {
        realOrderId = decodedExtra.orderId;
    }
  } catch (e) {
    console.error('Failed to parse extraData', e);
  }

  await prisma.payment.update({
    where: { orderId: realOrderId },
    data: { status: PaymentStatus.PAID, paidAt: new Date(), finalAmount: data.amount },
  });

  const order = await prisma.order.update({
    where: { id: realOrderId },
    data: { status: 'COMPLETED' },
  });

  if (order.tableSessionId) {
    await prisma.tableSession.update({
      where: { id: order.tableSessionId },
      data: { status: 'CLOSED', endedAt: new Date() },
    });
  }

  console.log(`✅ MoMo Payment Completed: ${realOrderId}`);
  return true;
}

/**
 * Check payment status
 */
export async function checkMoMoPaymentStatus(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  return { status: payment?.status || 'PENDING', orderStatus: order?.status || 'PENDING' };
}
