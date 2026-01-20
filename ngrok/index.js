const ngrok = require('@ngrok/ngrok');

const PORT = 4000; // Backend server port
const NGROK_PORT = 3001; // Ngrok listener port (different from backend)

async function startTunnel() {
  console.log('========================================');
  console.log('   NGROK TUNNEL FOR MOMO WEBHOOK');
  console.log('========================================\n');

  try {
    const listener = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTHTOKEN || '38UN251wK5luOCVX1rQQ2wTqMNQ_3fAzx61yRvTRZ9jrUcPoR',
    });

    const url = listener.url();
    console.log('✅ Tunnel started successfully!\n');
    console.log(`📡 Public URL: ${url}`);
    console.log(`🔗 Forwarding to: http://localhost:${PORT}\n`);
    console.log('========================================');
    console.log('Copy this to your backend/.env:');
    console.log(`MOMO_IPN_URL=${url}/api/v1/payment/momo/ipn`);
    console.log('========================================\n');
    console.log('Press Ctrl+C to stop the tunnel.\n');

  } catch (error) {
    console.error('❌ Failed to start ngrok:', error.message);
    process.exit(1);
  }
}

startTunnel();
