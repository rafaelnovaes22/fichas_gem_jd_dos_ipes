import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.usuario.count();
    console.log(`User count: ${count}`);
    await prisma.$disconnect();
}
main();
