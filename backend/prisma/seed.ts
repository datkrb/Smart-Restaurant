import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // XÓA DỮ LIỆU CŨ (theo thứ tự từ child → parent)
  // =========================
  console.log("🗑️  Cleaning old data...");

  try {
    await prisma.payment.deleteMany();
    await prisma.orderItemModifier.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.tableSession.deleteMany();
    await prisma.review.deleteMany();
    await prisma.menuItemPhoto.deleteMany();
    await prisma.modifierOption.deleteMany();
    await prisma.modifierGroup.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.table.deleteMany();
    await prisma.restaurant.deleteMany();
    // Không xóa User để giữ tài khoản admin

    console.log("✅ Old data cleaned!");
  } catch (error) {
    console.log("⚠️  Some tables don't exist yet, skipping cleanup...");
  }

  // =========================
  // USERS
  // =========================
  const passwordHash = await bcrypt.hash("123456", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@restaurant.com" },
    update: {},
    create: {
      email: "admin@restaurant.com",
      password: passwordHash,
      fullName: "Super Admin",
      role: Role.SUPER_ADMIN,
    },
  });

  // =========================
  // RESTAURANT
  // =========================
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Smart Restaurant",
      address: "Ho Chi Minh City",
    },
  });

  // =========================
  // TABLES
  // =========================
  const tables = await prisma.table.createMany({
    data: [
      { name: "Table 1", capacity: 4, restaurantId: restaurant.id },
      { name: "Table 2", capacity: 2, restaurantId: restaurant.id },
      { name: "Table 3", capacity: 6, restaurantId: restaurant.id },
    ],
  });

  // =========================
  // CATEGORIES
  // =========================
  const foodCategory = await prisma.category.create({
    data: {
      name: "Food",
      restaurantId: restaurant.id,
    },
  });

  const drinkCategory = await prisma.category.create({
    data: {
      name: "Drinks",
      restaurantId: restaurant.id,
    },
  });

  // =========================
  // MENU ITEMS
  // =========================
  const pizza = await prisma.menuItem.create({
    data: {
      name: "Pizza Margherita",
      price: 120000,
      categoryId: foodCategory.id,
      isChefRecommended: true,
    },
  });

  const coke = await prisma.menuItem.create({
    data: {
      name: "Coca Cola",
      price: 30000,
      categoryId: drinkCategory.id,
    },
  });

  // =========================
  // MODIFIERS
  // =========================
  const sizeGroup = await prisma.modifierGroup.create({
    data: {
      name: "Size",
      required: true,
      menuItemId: pizza.id,
    },
  });

  await prisma.modifierOption.createMany({
    data: [
      { name: "Small", priceDelta: 0, modifierGroupId: sizeGroup.id },
      { name: "Medium", priceDelta: 20000, modifierGroupId: sizeGroup.id },
      { name: "Large", priceDelta: 40000, modifierGroupId: sizeGroup.id },
    ],
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
