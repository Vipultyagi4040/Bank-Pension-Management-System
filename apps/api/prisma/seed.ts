import bcrypt from "bcryptjs";
import { AdminRole, PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.admin.upsert({
    where: { email: "admin@bank.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@bank.local",
      passwordHash,
      role: AdminRole.SUPER_ADMIN
    }
  });

  await prisma.pensioner.deleteMany({ where: { employeeId: "EMP001" } });
  const pensioner = await prisma.pensioner.create({
    data: {
      employeeId: "EMP001",
      mobile: "9999999999",
      name: "Demo Pensioner",
      department: "Banking Operations",
      designation: "Manager",
      status: UserStatus.APPROVED,
      registrationCompleted: true,
      approvedAt: new Date(),
      email: "demo@bank.local",
      gender: "Male",
      dateOfBirth: new Date("1965-05-15"),
      maritalStatus: "Married",
      fatherName: "Ramesh Kumar",
      panNumber: "ABCDE1234F",
      aadhaarNumber: "123456789012",
      bloodGroup: "O+",
      emergencyContactName: "Sunita Kumar",
      emergencyContactMobile: "9999999998",
      address: "123 Main Street, New Delhi, India - 110001",
      dateOfJoining: new Date("1990-06-01"),
      dateOfRetirement: new Date("2025-05-31"),
      pensionType: "Superannuation",
      bankAccountHolderName: "Demo Pensioner",
      bankAccountNumber: "1234567890",
      bankIfscCode: "BANK0001234",
      bankAccountType: "Savings",
      bankBranchName: "Main Branch",
      bankBranchAddress: "123 Main Street, New Delhi",
      nomineeName: "Sunita Kumar",
      nomineeRelation: "Spouse",
      nomineeShare: "100"
    }
  });

  await prisma.pensionDetail.create({
    data: {
      pensionerId: pensioner.id,
      ppoNumber: "PPO-DEMO-001",
      category: "Superannuation",
      pensionType: "Superannuation",
      basicPension: 28000,
      da: 8400,
      hra: 4200,
      medicalAllowance: 1000,
      otherAllowances: 3400,
      deductions: 2000,
      totalPension: 45000,
      pensionAmount: 45000,
      effectiveFrom: new Date("2026-01-01"),
      bankName: "Demo Bank",
      branchName: "Head Office",
      accountLastFour: "1234",
      isCurrent: true,
      status: "ACTIVE"
    }
  }).catch(() => undefined);

  const now = new Date();
  const slips = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slips.push({
      pensionerId: pensioner.id,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      grossAmount: 45000,
      deductions: 2000,
      netAmount: 43000,
      basicPension: 28000,
      da: 8400,
      hra: 4200,
      medicalAllowance: 1000,
      otherAllowances: 3400,
      documentUrl: `https://example.com/slips/${pensioner.id}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}.pdf`
    });
  }
  await prisma.pensionSlip.createMany({ data: slips });

  const policy = await prisma.policy.upsert({
    where: { policyNumber: "POL-2026-001" },
    update: {},
    create: {
      policyNumber: "POL-2026-001",
      title: "Group Health Insurance",
      coverageDetails: "Covers hospitalization, surgery, and outpatient treatments up to Rs. 5,00,000 per year.",
      claimGuidelines: "Submit original bills and discharge summary within 30 days.",
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-12-31"),
      documentUrl: "https://example.com/policies/health-2026.pdf",
      consentRequired: true,
      isPublished: true
    }
  });

  await prisma.pensionerPolicy.upsert({
    where: { pensionerId_policyId: { pensionerId: pensioner.id, policyId: policy.id } },
    update: {},
    create: {
      pensionerId: pensioner.id,
      policyId: policy.id,
      acknowledgedAt: new Date()
    }
  });

  const notification = await prisma.notification.create({
    data: {
      title: "Pension Slips for June 2026",
      message: "Your pension slips for June 2026 are now available. Please download from the portal.",
      audience: "ALL",
      publishedAt: new Date(),
      createdById: pensioner.id,
      receipts: {
        create: {
          pensionerId: pensioner.id
        }
      }
    }
  });

  await prisma.notificationReceipt.updateMany({
    where: { notificationId: notification.id, pensionerId: pensioner.id },
    data: { readAt: new Date() }
  });

  const notification2 = await prisma.notification.create({
    data: {
      title: "New Policy Available",
      message: "A new group health insurance policy is available for acknowledgement. Please review and consent.",
      audience: "ALL",
      publishedAt: new Date(),
      createdById: pensioner.id,
      receipts: {
        create: {
          pensionerId: pensioner.id
        }
      }
    }
  });

  await prisma.grievance.create({
    data: {
      pensionerId: pensioner.id,
      subject: "Pension amount discrepancy",
      description: "My pension amount for June 2026 is less than the expected amount. Please review.",
      status: "OPEN"
    }
  });

  await prisma.grievance.create({
    data: {
      pensionerId: pensioner.id,
      subject: "Bank account update request",
      description: "I have changed my bank account and want to update the details in the system.",
      status: "IN_PROGRESS",
      adminReply: "We have received your request. Please visit the nearest branch with your new account details."
    }
  });

  await prisma.jeevanPramaanRecord.create({
    data: {
      pensionerId: pensioner.id,
      applicationNumber: "JEE-2026-001",
      submissionDate: new Date("2026-06-15"),
      status: "SUBMITTED"
    }
  });

  await prisma.jeevanPramaanRecord.create({
    data: {
      pensionerId: pensioner.id,
      applicationNumber: "JEE-2025-089",
      submissionDate: new Date("2025-12-10"),
      verificationDate: new Date("2025-12-20"),
      status: "VERIFIED"
    }
  });

  await prisma.lead.create({
    data: {
      pensionerId: pensioner.id,
      name: "Demo Pensioner",
      mobile: "9999999999",
      product: "Term Insurance",
      remarks: "Interested in term insurance plan for family"
    }
  });

  console.log("Seed completed with demo data.");
}

main()
  .finally(async () => prisma.$disconnect());
