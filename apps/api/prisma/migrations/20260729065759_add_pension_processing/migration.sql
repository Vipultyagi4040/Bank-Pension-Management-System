/*
  Warnings:

  - Added the required column `updatedAt` to the `PensionDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basicPension` to the `PensionSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `da` to the `PensionSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hra` to the `PensionSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicalAllowance` to the `PensionSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherAllowances` to the `PensionSlip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PensionDetail" ADD COLUMN     "basicPension" DECIMAL(12,2),
ADD COLUMN     "da" DECIMAL(12,2),
ADD COLUMN     "deductions" DECIMAL(12,2),
ADD COLUMN     "hra" DECIMAL(12,2),
ADD COLUMN     "medicalAllowance" DECIMAL(12,2),
ADD COLUMN     "otherAllowances" DECIMAL(12,2),
ADD COLUMN     "pensionType" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "totalPension" DECIMAL(12,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PensionSlip" ADD COLUMN     "basicPension" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "da" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "hra" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "medicalAllowance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "otherAllowances" DECIMAL(12,2) NOT NULL;

-- CreateTable
CREATE TABLE "MonthlyPension" (
    "id" TEXT NOT NULL,
    "pensionerId" TEXT NOT NULL,
    "pensionDetailId" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicPension" DECIMAL(12,2) NOT NULL,
    "da" DECIMAL(12,2) NOT NULL,
    "hra" DECIMAL(12,2) NOT NULL,
    "medicalAllowance" DECIMAL(12,2) NOT NULL,
    "otherAllowances" DECIMAL(12,2) NOT NULL,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "deductions" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "slipUrl" TEXT,
    "processedById" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PensionProcessingLog" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalPensioners" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "processedById" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PensionProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyPension_month_year_status_idx" ON "MonthlyPension"("month", "year", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPension_pensionerId_month_year_key" ON "MonthlyPension"("pensionerId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyPension" ADD CONSTRAINT "MonthlyPension_pensionerId_fkey" FOREIGN KEY ("pensionerId") REFERENCES "Pensioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPension" ADD CONSTRAINT "MonthlyPension_pensionDetailId_fkey" FOREIGN KEY ("pensionDetailId") REFERENCES "PensionDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
