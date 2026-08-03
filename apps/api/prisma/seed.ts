import bcrypt from "bcryptjs";
import { AdminRole, PrismaClient, UserStatus, GrievanceStatus, JeevanPramaanStatus, NotificationAudience } from "@prisma/client";

const prisma = new PrismaClient();

const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Aryan", "Krishna", "Ishaan",
  "Dhruv", "Kian", "Arnav", "Rohan", "Advaith", "Akshat", "Kabir", "Ritvik", "Darsh", "Yash",
  "Ananya", "Aadhya", "Kavya", "Diya", "Saanvi", "Pari", "Ira", "Ahana", "Navya", "Riya",
  "Prisha", "Sia", "Tanya", "Sneha", "Pooja", "Neha", "Ritu", "Swati", "Anjali", "Meera",
  "Rajesh", "Suresh", "Mahesh", "Ramesh", "Dinesh", "Naresh", "Kamlesh", "Satish", "Vijay", "Ajay",
  "Sunita", "Kavita", "Geeta", "Rekha", "Shanti", "Lata", "Sarita", "Mamta", "Nisha", "Deepa"
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Rathore", "Singh", "Kumar", "Yadav", "Choudhary", "Mishra", "Tiwari",
  "Agarwal", "Banerjee", "Reddy", "Naidu", "Iyer", "Menon", "Nair", "Kulkarni", "Joshi", "Desai",
  "Patel", "Shah", "Mehta", "Bhat", "Hegde", "Gowda", "Pillai", "Bhattacharya", "Chatterjee", "Dutta"
];

const BANKS = [
  { name: "State Bank of India", ifscPrefix: "SBIN" },
  { name: "HDFC Bank", ifscPrefix: "HDFC" },
  { name: "ICICI Bank", ifscPrefix: "ICIC" },
  { name: "Bank of Baroda", ifscPrefix: "BARB" },
  { name: "Punjab National Bank", ifscPrefix: "PUNB" },
  { name: "Canara Bank", ifscPrefix: "CNRB" },
  { name: "Union Bank of India", ifscPrefix: "UBIN" },
  { name: "Axis Bank", ifscPrefix: "UTIB" },
  { name: "Kotak Mahindra Bank", ifscPrefix: "KKBK" },
  { name: "Bank of India", ifscPrefix: "BKID" }
];

const DEPARTMENTS = [
  "General Administration", "Finance", "Human Resources", "Operations", "Information Technology",
  "Customer Service", "Risk Management", "Compliance", "Audit", "Treasury",
  "Legal", "Marketing", "Credit", "Recovery", "Pension Administration"
];

const DESIGNATIONS = [
  "Manager", "Assistant Manager", "Senior Officer", "Officer", "Clerk",
  "Senior Clerk", "Assistant", "Executive", "Senior Executive", "General Manager",
  "Deputy General Manager", "Assistant General Manager", "Chief Manager", "Senior Manager", "Joint Manager"
];

const STATES = [
  "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat",
  "West Bengal", "Rajasthan", "Madhya Pradesh", "Punjab", "Haryana",
  "Telangana", "Andhra Pradesh", "Kerala", "Odisha", "Bihar"
];

const DISTRICTS: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Kolhapur"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Dharwad", "Shimoga"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Vellore", "Erode"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Gorakhpur", "Meerut", "Bareilly"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda", "Darjeeling", "Kharagpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Sikar", "Alwar"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Hoshiarpur"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur", "Kollam", "Alappuzha", "Palakkad"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur", "Balasore", "Baripada", "Jharsuguda"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Munger", "Purnia", "Saharsa"]
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUSES = ["Single", "Married", "Widowed", "Divorced"];
const PENSION_TYPES = ["Superannuation", "Voluntary Retirement", "Compulsory Retirement", "Disability"];
const CATEGORIES = ["Superannuation", "Family", "Commuted", "Self"];
const POLICY_TITLES = [
  "Group Health Insurance", "Group Term Life Insurance", "Personal Accident Insurance",
  "Critical Illness Cover", "Hospital Cash Plan", "Outpatient Cover", "Maternity Benefit",
  "Dental Insurance", "Vision Care Plan", "Wellness Program",
  "Long-term Care Insurance", "Mediclaim Policy", "Senior Citizen Health Plan", "Family Floater Policy",
  "Cashless Mediclaim", "Top-up Health Cover", "Overseas Mediclaim", "Ayushman Cover"
];

const GRIEVANCE_SUBJECTS = [
  "Pension amount discrepancy", "Bank account update request", "Address correction needed",
  "Pension not received", "Incorrect deductions", "Nominee change request",
  "Jeevan Pramaan verification delay", "Pension slip not generated", "Tax deduction issue",
  "Arrears not paid", "Pension enhancement request", "Family pension transfer",
  "Commutation calculation error", "DA arrears pending", "HRA not credited",
  "Medical allowance issue", "Pension revision request", "Branch transfer request",
  "NEFT/RTGS failure", "Pension stopped without notice"
];

const GRIEVANCE_DESCRIPTIONS = [
  "I am writing to bring to your attention a discrepancy in my pension amount. Kindly review and take necessary action.",
  "There seems to be an issue with my pension calculation. I request you to verify the records and correct the same.",
  "My pension has not been credited for the last two months. I have checked with my bank branch and they have confirmed no receipt.",
  "I would like to update my bank account details in the system. Please guide me through the process.",
  "The deductions mentioned in my pension slip seem incorrect. Please review and provide clarification.",
  "I need to change my nominee details. Kindly provide the necessary forms and procedure.",
  "My Jeevan Pramaan verification is pending for a long time. Please expedite the process.",
  "I have not received my pension slip for the last month. Please send the same at the earliest.",
  "There is an issue with tax deduction from my pension. Kindly review and correct the same.",
  "My pension arrears have not been processed despite multiple requests."
];

const NOTIFICATION_TITLES = [
  "Pension Slips Generated", "New Policy Available", "Jeevan Pramaan Verification Complete",
  "Pension Amount Updated", "Annual Statement Ready", "Tax Certificate Available",
  "Bank Account Verification Required", "Nominee Details Update", "DA Arrears Released",
  "Holiday Notice", "System Maintenance", "New Circular Issued",
  "Pension Processing Complete", "Grievance Update", "Policy Acknowledgement Required",
  "Monthly Pension Credited", "Annual Verification Due", "Profile Update Required",
  "Document Verification Pending", "Payment Confirmation"
];

const NOTIFICATION_MESSAGES = [
  "Your pension slips for this month have been generated. Please download from the portal.",
  "A new insurance policy is available for your acknowledgement. Please review and consent.",
  "Your Jeevan Pramaan verification has been completed successfully.",
  "Your pension amount has been updated effective from this month. Please check the details.",
  "Your annual pension statement is now available for download.",
  "Your tax deduction certificate for this financial year is ready.",
  "Please complete the bank account verification process by uploading required documents.",
  "Update your nominee details to ensure smooth pension processing.",
  "DA arrears for the previous quarter have been released. Please check your account.",
  "The office will remain closed on the occasion of public holiday."
];

const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "APPROVE", "REJECT", "EXPORT", "IMPORT", "PROCESS"];
const ENTITY_TYPES = ["Pensioner", "PensionDetail", "Grievance", "Notification", "Policy", "JeevanPramaanRecord", "MonthlyPension"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateAadhaar(): string {
  const digits = Array.from({ length: 12 }, () => randomInt(0, 9)).join("");
  return digits;
}

function generatePAN(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const first = chars[randomInt(0, 25)];
  const second = chars[randomInt(0, 25)];
  const third = chars[randomInt(0, 25)];
  const fourth = chars[randomInt(0, 25)];
  const fifth = chars[randomInt(0, 25)];
  const numbers = Array.from({ length: 4 }, () => randomInt(0, 9)).join("");
  const last = chars[randomInt(0, 25)];
  return `${first}${second}${third}${fourth}${fifth}${numbers}${last}`;
}

function generatePPO(index: number): string {
  return `PPO-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`;
}

function generateIFSC(prefix: string): string {
  const rest = Array.from({ length: 6 }, () => randomInt(0, 9)).join("");
  return `${prefix}${rest}`;
}

function generateAccountNumber(): string {
  return Array.from({ length: 10 }, () => randomInt(0, 9)).join("");
}

function generateMobile(index: number): string {
  const prefixes = ["6", "7", "8", "9"];
  const prefix = prefixes[index % 4];
  const rest = Array.from({ length: 9 }, () => randomInt(0, 9)).join("");
  return `${prefix}${rest}`;
}

function generateEmail(name: string, index: number): string {
  const clean = name.toLowerCase().replace(/[^a-z]/g, "");
  return `${clean}${index + 1}@example.com`;
}

async function createAdmins() {
  const admins = [
    { name: "Super Admin", email: "admin@bank.local", role: AdminRole.SUPER_ADMIN },
    { name: "User Manager", email: "user.manager@bank.local", role: AdminRole.USER_MANAGER },
    { name: "Pension Manager", email: "pension.manager@bank.local", role: AdminRole.PENSION_MANAGER },
    { name: "Policy Manager", email: "policy.manager@bank.local", role: AdminRole.POLICY_MANAGER },
    { name: "Report Viewer", email: "report.viewer@bank.local", role: AdminRole.REPORT_VIEWER },
    { name: "Operations Head", email: "ops.head@bank.local", role: AdminRole.SUPER_ADMIN },
    { name: "Audit Officer", email: "audit.officer@bank.local", role: AdminRole.REPORT_VIEWER },
    { name: "Customer Support Lead", email: "cs.lead@bank.local", role: AdminRole.USER_MANAGER },
    { name: "Finance Controller", email: "finance.ctrl@bank.local", role: AdminRole.PENSION_MANAGER },
    { name: "IT Administrator", email: "it.admin@bank.local", role: AdminRole.SUPER_ADMIN }
  ];

  const passwordHash = await bcrypt.hash("Admin@123", 12);

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: admin.role,
        isActive: true
      }
    });
  }
}

async function createPensioners() {
  const pensioners = [];
  const usedMobiles = new Set<string>();
  const usedAadhaars = new Set<string>();

  for (let i = 0; i < 100; i++) {
    const firstName = randomItem(INDIAN_FIRST_NAMES);
    const lastName = randomItem(INDIAN_LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const gender = Math.random() > 0.3 ? "Male" : "Female";
    const state = randomItem(STATES);
    const district = randomItem(DISTRICTS[state]);
    const mobile = generateMobile(i);
    const aadhaar = generateAadhaar();
    const pan = generatePAN();
    const bank = randomItem(BANKS);
    const status = randomItem<UserStatus>([UserStatus.APPROVED, UserStatus.APPROVED, UserStatus.APPROVED, UserStatus.PENDING, UserStatus.INACTIVE]);
    const dateOfBirth = randomDate(new Date(1950, 0, 1), new Date(1990, 11, 31));
    const dateOfJoining = randomDate(new Date(1985, 0, 1), new Date(2010, 11, 31));
    const dateOfRetirement = new Date(dateOfJoining.getTime() + randomInt(15, 35) * 365 * 24 * 60 * 60 * 1000);

    const pensioner = {
      employeeId: `EMP${String(i + 1).padStart(3, "0")}`,
      mobile,
      email: generateEmail(firstName, i),
      name,
      gender,
      dateOfBirth,
      maritalStatus: randomItem(MARITAL_STATUSES),
      fatherName: `${randomItem(INDIAN_FIRST_NAMES)} ${lastName}`,
      panNumber: pan,
      aadhaarNumber: aadhaar,
      bloodGroup: randomItem(BLOOD_GROUPS),
      emergencyContactName: `${randomItem(INDIAN_FIRST_NAMES)} ${lastName}`,
      emergencyContactMobile: generateMobile(i + 100),
      address: `${randomInt(1, 999)} ${randomItem(["Main", "Park", "Temple", "Market", "Station"])} Road, ${district}, ${state} - ${randomInt(100000, 999999)}`,
      department: randomItem(DEPARTMENTS),
      designation: randomItem(DESIGNATIONS),
      dateOfJoining,
      dateOfRetirement,
      pensionType: randomItem(PENSION_TYPES),
      bankAccountHolderName: name,
      bankAccountNumber: generateAccountNumber(),
      bankIfscCode: generateIFSC(bank.ifscPrefix),
      bankAccountType: randomItem(["Savings", "Current"]),
      bankBranchName: `${district} Branch`,
      bankBranchAddress: `${randomInt(1, 999)} ${randomItem(["Main", "Market", "Station"])} Road, ${district}, ${state}`,
      nomineeName: `${randomItem(INDIAN_FIRST_NAMES)} ${lastName}`,
      nomineeRelation: randomItem(["Spouse", "Son", "Daughter", "Parent", "Sibling"]),
      nomineeShare: String(randomInt(10, 100)),
      status,
      registrationCompleted: true,
      approvedAt: status === UserStatus.APPROVED ? randomDate(new Date(2020, 0, 1), new Date(2026, 5, 30)) : null
    };

    pensioners.push(pensioner);
    usedMobiles.add(mobile);
    usedAadhaars.add(aadhaar);
  }

  const createdPensioners = [];
  for (const data of pensioners) {
    const created = await prisma.pensioner.upsert({
      where: { employeeId: data.employeeId },
      update: {},
      create: data
    });
    createdPensioners.push(created);
  }

  return createdPensioners;
}

async function createPensionDetails(pensioners: any[]) {
  for (const pensioner of pensioners) {
    const basicPension = randomInt(15000, 75000);
    const da = Math.round(basicPension * randomInt(20, 35) / 100);
    const hra = Math.round(basicPension * randomInt(8, 20) / 100);
    const medicalAllowance = randomInt(500, 3000);
    const otherAllowances = randomInt(1000, 8000);
    const deductions = randomInt(500, 5000);
    const totalPension = basicPension + da + hra + medicalAllowance + otherAllowances;
    const pensionAmount = totalPension - deductions;

    await prisma.pensionDetail.create({
      data: {
        pensionerId: pensioner.id,
        ppoNumber: generatePPO(parseInt(pensioner.employeeId.slice(3))),
        category: randomItem(CATEGORIES),
        pensionType: pensioner.pensionType || randomItem(PENSION_TYPES),
        basicPension,
        da,
        hra,
        medicalAllowance,
        otherAllowances,
        deductions,
        totalPension,
        pensionAmount,
        effectiveFrom: new Date(pensioner.dateOfRetirement || Date.now()),
        bankName: randomItem(BANKS).name,
        branchName: pensioner.bankBranchName || "Main Branch",
        accountLastFour: pensioner.bankAccountNumber?.slice(-4) || "1234",
        isCurrent: true,
        status: "ACTIVE"
      }
    }).catch(() => undefined);
  }
}

async function createMonthlyPensions(pensioners: any[]) {
  for (const pensioner of pensioners) {
    const pensionDetail = await prisma.pensionDetail.findFirst({
      where: { pensionerId: pensioner.id }
    });

    if (!pensionDetail) continue;

    for (let month = 0; month < 12; month++) {
      const d = new Date();
      d.setMonth(d.getMonth() - month);
      const year = d.getFullYear();
      const m = d.getMonth() + 1;

      const basicPension = Number(pensionDetail.basicPension);
      const da = Number(pensionDetail.da);
      const hra = Number(pensionDetail.hra);
      const medicalAllowance = Number(pensionDetail.medicalAllowance);
      const otherAllowances = Number(pensionDetail.otherAllowances);
      const grossAmount = basicPension + da + hra + medicalAllowance + otherAllowances;
      const deductions = Number(pensionDetail.deductions);
      const netAmount = grossAmount - deductions;

      await prisma.monthlyPension.create({
        data: {
          pensionerId: pensioner.id,
          pensionDetailId: pensionDetail.id,
          month: m,
          year,
          basicPension,
          da,
          hra,
          medicalAllowance,
          otherAllowances,
          grossAmount,
          deductions,
          netAmount,
          status: randomItem(["PENDING", "PROCESSED", "PAID", "PAID", "PAID"]),
          paymentDate: randomItem(["PENDING", "PROCESSED", "PAID", "PAID", "PAID"]) === "PAID" ? randomDate(new Date(year, m - 1, 1), new Date(year, m - 1, 31)) : null,
          slipUrl: `https://example.com/slips/${pensioner.id}-${year}-${String(m).padStart(2, "0")}.pdf`
        }
      }).catch(() => undefined);
    }
  }
}

async function createPolicies() {
  for (let i = 0; i < 40; i++) {
    const policyNumber = `POL-2026-${String(i + 1).padStart(3, "0")}`;
    await prisma.policy.upsert({
      where: { policyNumber },
      update: {},
      create: {
        policyNumber,
        title: randomItem(POLICY_TITLES),
        coverageDetails: "Comprehensive coverage for pensioners and their families with cashless hospitalization and network hospitals across India.",
        claimGuidelines: "Submit original bills, discharge summary, and prescription within 30 days of discharge. Cashless claims require pre-authorization.",
        validFrom: new Date(2026, 0, 1),
        validTo: new Date(2026, 11, 31),
        documentUrl: `https://example.com/policies/policy-${policyNumber}.pdf`,
        consentRequired: Math.random() > 0.3,
        isPublished: Math.random() > 0.2
      }
    });
  }
}

async function createNotifications(pensioners: any[]) {
  for (let i = 0; i < 200; i++) {
    const notification = await prisma.notification.create({
      data: {
        title: randomItem(NOTIFICATION_TITLES),
        message: randomItem(NOTIFICATION_MESSAGES),
        audience: randomItem([NotificationAudience.ALL, NotificationAudience.SELECTED]),
        publishedAt: randomDate(new Date(2025, 0, 1), new Date(2026, 5, 30)),
        createdById: randomItem(pensioners).id,
        scheduledAt: Math.random() > 0.7 ? randomDate(new Date(2026, 6, 1), new Date(2026, 12, 31)) : null
      }
    });

    const selectedPensioners = Math.random() > 0.5 ? pensioners.slice(0, randomInt(5, 20)) : [randomItem(pensioners)];
    for (const pensioner of selectedPensioners) {
      await prisma.notificationReceipt.create({
        data: {
          notificationId: notification.id,
          pensionerId: pensioner.id,
          readAt: Math.random() > 0.4 ? randomDate(new Date(2025, 0, 1), new Date(2026, 5, 30)) : null
        }
      }).catch(() => undefined);
    }
  }
}

async function createGrievances(pensioners: any[]) {
  for (let i = 0; i < 100; i++) {
    const pensioner = randomItem(pensioners);
    const status = randomItem<GrievanceStatus>([
      GrievanceStatus.OPEN,
      GrievanceStatus.IN_PROGRESS,
      GrievanceStatus.RESOLVED,
      GrievanceStatus.CLOSED
    ]);

    const grievance = await prisma.grievance.create({
      data: {
        pensionerId: pensioner.id,
        subject: randomItem(GRIEVANCE_SUBJECTS),
        description: randomItem(GRIEVANCE_DESCRIPTIONS),
        status,
        adminReply: status === GrievanceStatus.RESOLVED || status === GrievanceStatus.CLOSED
          ? "We have reviewed your grievance and taken necessary action. Please contact the branch for further details."
          : null,
        assignedTo: randomItem(pensioners).name
      }
    });

    await prisma.grievanceHistory.create({
      data: {
        grievanceId: grievance.id,
        action: "STATUS_CHANGE",
        fromStatus: GrievanceStatus.OPEN,
        toStatus: status,
        note: "Grievance registered and assigned to concerned department.",
        performedBy: randomItem(pensioners).name
      }
    });
  }
}

async function createJeevanPramaanRecords(pensioners: any[]) {
  for (let i = 0; i < 100; i++) {
    const pensioner = randomItem(pensioners);
    const status = randomItem<JeevanPramaanStatus>([
      JeevanPramaanStatus.NOT_SUBMITTED,
      JeevanPramaanStatus.SUBMITTED,
      JeevanPramaanStatus.VERIFIED,
      JeevanPramaanStatus.REJECTED,
      JeevanPramaanStatus.EXPIRED
    ]);

    await prisma.jeevanPramaanRecord.create({
      data: {
        pensionerId: pensioner.id,
        applicationNumber: `JEE-2026-${String(i + 1).padStart(3, "0")}`,
        submissionDate: status !== JeevanPramaanStatus.NOT_SUBMITTED ? randomDate(new Date(2025, 0, 1), new Date(2026, 5, 30)) : null,
        verificationDate: status === JeevanPramaanStatus.VERIFIED ? randomDate(new Date(2025, 6, 1), new Date(2026, 5, 30)) : null,
        status,
        remarks: status === JeevanPramaanStatus.REJECTED ? "Documents incomplete. Please resubmit." : null
      }
    });
  }
}

async function createAuditLogs(pensioners: any[]) {
  const admins = await prisma.admin.findMany();
  for (let i = 0; i < 200; i++) {
    await prisma.auditLog.create({
      data: {
        adminId: randomItem(admins).id,
        action: randomItem(AUDIT_ACTIONS),
        entityType: randomItem(ENTITY_TYPES),
        entityId: randomItem(pensioners).id,
        metadata: { timestamp: new Date().toISOString(), userAgent: "Mozilla/5.0" },
        ipAddress: `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`
      }
    });
  }
}

async function main() {
  await createAdmins();
  const pensioners = await createPensioners();
  await createPensionDetails(pensioners);
  await createMonthlyPensions(pensioners);
  await createPolicies();
  await createNotifications(pensioners);
  await createGrievances(pensioners);
  await createJeevanPramaanRecords(pensioners);
  await createAuditLogs(pensioners);

  console.log("Seed completed successfully with realistic Indian demo data.");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
