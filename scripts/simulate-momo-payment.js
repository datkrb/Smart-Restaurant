const crypto = require('crypto');
const http = require('http');

// CONFIG MATCHING YOUR BACKEND
const CONFIG = {
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  partnerCode: 'MOMO',
  ipnUrl: 'http://localhost:4000/api/v1/payment/momo/ipn' // Local backend URL
};

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node simulate-momo-payment.js <momo_order_id_from_logs> <amount>');
  console.log('Example: node simulate-momo-payment.js d20a381f-3570-429a-82dd-883526543b59_1737357421123 470000');
  process.exit(1);
}

const momoOrderId = args[0];
const amount = args[1]; // Must match exactly what was sent
const originalOrderId = momoOrderId.split('_')[0];

console.log('--------------------------------------------------');
console.log('🚀 SIMULATING MOMO SUCCESSFUL PAYMENT (IPN)');
console.log('--------------------------------------------------');
console.log(`Checking Order: ${momoOrderId}`);
console.log(`Amount:         ${amount}`);
console.log(`Original ID:    ${originalOrderId}`);

// Construct Extra Data (Must match backend logic)
const extraDataObj = { orderId: originalOrderId };
const extraData = Buffer.from(JSON.stringify(extraDataObj)).toString('base64');

// Payload structure matches MoMo IPN format
const payload = {
  partnerCode: CONFIG.partnerCode,
  orderId: momoOrderId,
  requestId: momoOrderId, // Using same for convenience
  amount: Number(amount),
  orderInfo: 'Simulated Payment',
  orderType: 'momo_wallet',
  transId: 123456789,
  resultCode: 0, // 0 = Success
  message: 'Successful details for simulated transaction',
  payType: 'qr',
  responseTime: Date.now(),
  extraData: extraData, 
};

// Create Signature
const rawSignature = [
  `accessKey=${CONFIG.accessKey}`,
  `amount=${payload.amount}`,
  `extraData=${payload.extraData}`,
  `message=${payload.message}`,
  `orderId=${payload.orderId}`,
  `orderInfo=${payload.orderInfo}`,
  `orderType=${payload.orderType}`,
  `partnerCode=${payload.partnerCode}`,
  `payType=${payload.payType}`,
  `requestId=${payload.requestId}`,
  `responseTime=${payload.responseTime}`,
  `resultCode=${payload.resultCode}`,
  `transId=${payload.transId}`,
].join('&');

const signature = crypto.createHmac('sha256', CONFIG.secretKey)
  .update(rawSignature)
  .digest('hex');

payload.signature = signature;

// Send Request
const postData = JSON.stringify(payload);

const url = new URL(CONFIG.ipnUrl);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  console.log(`\n📡 STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ SIMULATION SUCCESS! The backend should verify and complete the order.');
    } else {
      console.log('\n❌ FAILED. Check backend logs for errors.');
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ REQUEST ERROR: ${e.message}`);
});

req.write(postData);
req.end();
