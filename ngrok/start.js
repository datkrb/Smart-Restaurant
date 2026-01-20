require('dotenv').config();
const ngrok = require('ngrok');

const PORT = 4000;

async function startTunnel() {
  console.log('========================================');
  console.log('   NGROK TUNNEL FOR MOMO WEBHOOK');
  console.log('========================================\n');

  try {
    // Set authtoken if provided
    if (process.env.NGROK_AUTHTOKEN) {
      await ngrok.authtoken(process.env.NGROK_AUTHTOKEN);
    }

    const url = await ngrok.connect(PORT);

    console.log('✅ Tunnel started successfully!\n');
    console.log(`📡 Public URL: ${url}`);
    console.log(`🔗 Local:      http://localhost:${PORT}\n`);
    console.log('========================================');
    console.log('Copy this to your backend/.env:');
    console.log(`MOMO_IPN_URL=${url}/api/v1/payment/momo/ipn`);
    console.log('========================================\n');
    console.log('Press Ctrl+C to stop the tunnel.\n');

  } catch (error) {
    console.error('❌ Failed to start ngrok:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Make sure ngrok is installed: npm install ngrok');
    console.log('  2. Check your NGROK_AUTHTOKEN in .env');
    console.log('  3. Try running: npx ngrok http 4000');
    process.exit(1);
  }
}

startTunnel();
