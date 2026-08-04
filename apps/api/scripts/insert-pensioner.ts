import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const pensioner = await prisma.pensioner.upsert({
    where: { mobile: "9999999999" },
    update: {
      status: UserStatus.APPROVED,
      registrationCompleted: true,
      name: "Demo Pensioner",
      employeeId: "EMP9999"
    },
    create: {
      employeeId: "EMP9999",
      mobile: "9999999999",
      name: "Demo Pensioner",
      status: UserStatus.APPROVED,
      registrationCompleted: true
    }
  });
  console.log("Pensioner ready:", pensioner.mobile, pensioner.name);
  await prisma.$disconnect();
})();
