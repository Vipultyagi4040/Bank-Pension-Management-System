-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'USER_MANAGER', 'PENSION_MANAGER', 'POLICY_MANAGER', 'REPORT_VIEWER');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JeevanPramaanStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('ALL', 'SELECTED');

-- CreateTable
CREATE TABLE "Pensioner" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "department" TEXT,
    "designation" TEXT,
    "address" TEXT,
    "profilePhotoUrl" TEXT,
    "idCardUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "registrationCompleted" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pensioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PensionDetail" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "ppoNumber" TEXT NOT NULL,
    "category" TEXT,
    "pensionAmount" DECIMAL(12,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "bankName" TEXT,
    "branchName" TEXT,
    "accountLastFour" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PensionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PensionSlip" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "deductions" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PensionSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverageDetails" TEXT,
    "claimGuidelines" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "documentUrl" TEXT,
    "consentRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PensionerPolicy" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "consentGivenAt" TIMESTAMP(3),

    CONSTRAINT "PensionerPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JeevanPramaanRecord" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "applicationNumber" TEXT,
    "submissionDate" TIMESTAMP(3),
    "verificationDate" TIMESTAMP(3),
    "status" "JeevanPramaanStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JeevanPramaanRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "adminReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" "NotificationAudience" NOT NULL DEFAULT 'ALL',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationReceipt" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "NotificationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "product" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'USER_MANAGER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pensioner_employeeId_key" ON "Pensioner"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Pensioner_mobile_key" ON "Pensioner"("mobile");

-- CreateIndex
CREATE INDEX "PensionDetail_pensionerId_effectiveFrom_idx" ON "PensionDetail"("pensionerId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "PensionSlip_pensionerId_month_year_key" ON "PensionSlip"("pensionerId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyNumber_key" ON "Policy"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PensionerPolicy_pensionerId_policyId_key" ON "PensionerPolicy"("pensionerId", "policyId");

-- CreateIndex
CREATE INDEX "Grievance_pensionerId_status_idx" ON "Grievance"("pensionerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationReceipt_notificationId_pensionerId_key" ON "NotificationReceipt"("notificationId", "pensionerId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "OtpCode_mobile_expiresAt_idx" ON "OtpCode"("mobile", "expiresAt");

-- AddForeignKey
ALTER TABLE "PensionDetail" ADD CONSTRAINT "PensionDetail_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PensionSlip" ADD CONSTRAINT "PensionSlip_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PensionerPolicy" ADD CONSTRAINT "PensionerPolicy_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PensionerPolicy" ADD CONSTRAINT "PensionerPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JeevanPramaanRecord" ADD CONSTRAINT "JeevanPramaanRecord_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationReceipt" ADD CONSTRAINT "NotificationReceipt_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationReceipt" ADD CONSTRAINT "NotificationReceipt_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
