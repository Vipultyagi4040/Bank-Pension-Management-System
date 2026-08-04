const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pensioner.findFirst({
    where: { mobile: '9999999999' },
    include: { pensionDetails: true }
  });
  console.log(JSON.stringify(p, null, 2));
  await prisma.$disconnect();
}

main();
