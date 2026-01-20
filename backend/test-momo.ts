
import { PrismaClient, OrderStatus, TableSessionStatus } from '@prisma/client';
import * as momoService from './src/modules/payment/momo.service';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting MoMo Payment Test...');

  try {
    // 1. Create Dummy Restaurant
    const restaurant = await prisma.restaurant.upsert({
      where: { id: 'test-restaurant' },
      update: {},
      create: {
        id: 'test-restaurant',
        name: 'Test Restaurant',
        address: '123 Test St',
      },
    });
    console.log('✅ Restaurant checked/created');

    // 2. Create Dummy Table
    const table = await prisma.table.upsert({
      where: { id: 'test-table' },
      update: {},
      create: {
        id: 'test-table',
        restaurantId: restaurant.id,
        name: 'Test Table 1',
        capacity: 4,
      },
    });
    console.log('✅ Table checked/created');

    // 3. Create Dummy Session
    // We create a new one to avoid unique constraint on order-session if we re-run
    const session = await prisma.tableSession.create({
      data: {
        tableId: table.id,
        status: TableSessionStatus.OPEN,
      },
    });
    console.log('✅ Session created:', session.id);

    // 4. Create Dummy Order
    const order = await prisma.order.create({
      data: {
        tableSessionId: session.id,
        status: OrderStatus.RECEIVED,
        totalAmount: 50000, // 50,000 VND
      },
    });
    console.log('✅ Order created:', order.id);

    // 5. Initiate MoMo Payment
    console.log('💳 Initiating MoMo Payment...');
    const result = await momoService.createMoMoPayment(order.id);

    console.log('\n==================================================');
    console.log('🎉 PAYMENT LINK CREATED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Pay URL:', result.payUrl);
    console.log('DeepLink:', result.deeplink);
    console.log('QR Code:', result.qrCodeUrl);
    console.log('==================================================\n');

    console.log('👉 Click the Pay URL above to simulate payment.');
    console.log('ℹ️  Ensure your Ngrok tunnel is running to receive the callback.');

  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
