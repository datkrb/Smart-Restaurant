import { PrismaClient, Role, MenuItemStatus } from "@prisma/client";
import bcrypt from "bcryptjs"; // Updated to bcryptjs as used in other files

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clean up existing data (Optional: comment out if you want to keep data)
  // await prisma.orderItemModifier.deleteMany();
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.modifierOption.deleteMany();
  // await prisma.modifierGroup.deleteMany();
  // await prisma.review.deleteMany();
  // await prisma.menuItem.deleteMany();
  // await prisma.category.deleteMany();
  // await prisma.tableSession.deleteMany();
  // await prisma.table.deleteMany();
  // await prisma.restaurant.deleteMany();
  // await prisma.user.deleteMany();

  // =========================
  // USERS
  // =========================
  const passwordHash = await bcrypt.hash("123456", 10);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@restaurant.com" },
    update: {
      password: passwordHash,
      isVerified: true, // <--- Quan trọng: Đã verify
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: "admin@restaurant.com",
      password: passwordHash,
      fullName: "Super Admin",
      role: Role.SUPER_ADMIN,
      isVerified: true, // <--- Quan trọng: Đã verify
      isActive: true,
    },
  });

  console.log("👤 Created/Updated Admin:", superAdmin.email);

  // Kitchen Staff
  await prisma.user.upsert({
    where: { email: "kitchen@restaurant.com" },
    update: { isVerified: true, role: Role.KITCHEN },
    create: {
      email: "kitchen@restaurant.com",
      password: passwordHash,
      fullName: "Chef Gordon",
      role: Role.KITCHEN,
      isVerified: true,
    },
  });

  // Waiter
  await prisma.user.upsert({
    where: { email: "waiter@restaurant.com" },
    update: { isVerified: true, role: Role.WAITER },
    create: {
      email: "waiter@restaurant.com",
      password: passwordHash,
      fullName: "John Waiter",
      role: Role.WAITER,
      isVerified: true,
    },
  });

  // =========================
  // RESTAURANT
  // =========================
  // Check if restaurant exists, otherwise create
  let restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "Smart Restaurant",
        address: "123 Food Street, HCM",
      },
    });
    console.log("🏠 Created Restaurant:", restaurant.name);
  } else {
    console.log("🏠 Using existing Restaurant:", restaurant.name);
  }

  // =========================
  // TABLES
  // =========================
  const tableCount = await prisma.table.count({ where: { restaurantId: restaurant.id } });
  if (tableCount === 0) {
    await prisma.table.createMany({
      data: [
        { name: "T1", capacity: 2, restaurantId: restaurant.id },
        { name: "T2", capacity: 4, restaurantId: restaurant.id },
        { name: "T3", capacity: 4, restaurantId: restaurant.id },
        { name: "VIP 1", capacity: 8, restaurantId: restaurant.id },
      ],
    });
    console.log("🪑 Seeding Tables...");
  }

  // =========================
  // CATEGORIES & MENU ITEMS
  // =========================
  const catCount = await prisma.category.count({ where: { restaurantId: restaurant.id } });
  
  if (catCount === 0) {
    // CATEGORY: FOOD
    const foodCat = await prisma.category.create({
      data: { name: "Food", restaurantId: restaurant.id },
    });

    // CATEGORY: DRINKS
    const drinkCat = await prisma.category.create({
      data: { name: "Drinks", restaurantId: restaurant.id },
    });

    // ITEMS for FOOD
    const pizza = await prisma.menuItem.create({
      data: {
        name: "Pizza Margherita",
        description: "Tomato sauce, mozzarella, and basil",
        price: 150000,
        categoryId: foodCat.id,
        isChefRecommended: true,
        status: MenuItemStatus.AVAILABLE,
        photos: {
            create: {
                url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=1000",
                isPrimary: true
            }
        }
      },
    });

    // MODIFIERS for Pizza
    const sizeGroup = await prisma.modifierGroup.create({
      data: {
         name: "Size",
         required: true,
         menuItemId: pizza.id,
      }
    });

    await prisma.modifierOption.createMany({
        data: [
            { name: "S (6 inch)", priceDelta: 0, modifierGroupId: sizeGroup.id },
            { name: "M (9 inch)", priceDelta: 50000, modifierGroupId: sizeGroup.id },
            { name: "L (12 inch)", priceDelta: 100000, modifierGroupId: sizeGroup.id },
        ]
    });

    // ITEMS for DRINKS
    await prisma.menuItem.create({
      data: {
        name: "Coca Cola", 
        price: 20000,
        categoryId: drinkCat.id,
        status: MenuItemStatus.AVAILABLE,
        photos: {
            create: {
                url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1000",
                isPrimary: true
            }
        }
      }
    });

    console.log("🍔 Seeding Menu Items...");
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
