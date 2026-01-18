import { Request, Response } from 'express';
import * as paymentService from './payment.service';
import { PaymentMethod } from '@prisma/client';
import Stripe from 'stripe';

const stripe = paymentService.stripe;

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const result = await paymentService.createPaymentIntent(orderId);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
};
export const confirmCashPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentMethod, discountAmount, discountType, finalAmount } = req.body;

    // Map payment method string to enum
    let method: PaymentMethod = PaymentMethod.CASH;
    if (paymentMethod === 'CARD' || paymentMethod === 'STRIPE') {
      method = PaymentMethod.STRIPE;
    } else if (paymentMethod === 'MOMO') {
      method = PaymentMethod.MOMO;
    } else if (paymentMethod === 'VNPAY') {
      method = PaymentMethod.VNPAY;
    } else if (paymentMethod === 'ZALOPAY') {
      method = PaymentMethod.ZALOPAY;
    }

    await paymentService.processSuccessPayment(
      orderId,
      method,
      discountAmount || 0,
      discountType || null,
      finalAmount || null
    );
    res.json({ message: 'Payment confirmed. Session closed.' });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// WEBHOOK: Stripe tự gọi vào đây (QUAN TRỌNG)
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Xác thực request này thực sự đến từ Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // Lưu ý: Body phải là Raw Buffer (cần config express)
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle sự kiện thanh toán thành công
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    console.log(`💰 Payment succeeded for Order ${orderId}`);

    // Gọi service update DB
    if (orderId) {
      await paymentService.processSuccessPayment(orderId, PaymentMethod.STRIPE);
    }
  }

  res.json({ received: true });
};