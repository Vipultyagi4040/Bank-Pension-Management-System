import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const details = await prisma.pensionDetail.findMany({
    include: { pensioner: true }
  });
  console.log(JSON.stringify(details, null, 2));
  await prisma.$disconnect();
}

main();
