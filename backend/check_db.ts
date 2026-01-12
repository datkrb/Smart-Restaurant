
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.menuItem.count();
    console.log(`[DB CHECK] Food Items Count: ${count}`);
    
    if (count === 0) {
        console.log("Database is empty! Run 'npx prisma db seed' to populate data.");
    } else {
        const items = await prisma.menuItem.findMany();
        console.log("Sample item:", items[0]);
    }
  } catch (e) {
    console.error("Error accessing DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
