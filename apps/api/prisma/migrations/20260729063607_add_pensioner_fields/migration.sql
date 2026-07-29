-- AlterTable
ALTER TABLE "Pensioner" ADD COLUMN     "aadhaarNumber" TEXT,
ADD COLUMN     "bankAccountHolderName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankAccountType" TEXT,
ADD COLUMN     "bankBranchAddress" TEXT,
ADD COLUMN     "bankBranchName" TEXT,
ADD COLUMN     "bankIfscCode" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dateOfJoining" TIMESTAMP(3),
ADD COLUMN     "dateOfRetirement" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emergencyContactMobile" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "nomineeName" TEXT,
ADD COLUMN     "nomineeRelation" TEXT,
ADD COLUMN     "nomineeShare" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "pensionType" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- CreateIndex
CREATE INDEX "Pensioner_status_idx" ON "Pensioner"("status");

-- CreateIndex
CREATE INDEX "Pensioner_deletedAt_idx" ON "Pensioner"("deletedAt");

-- CreateIndex
CREATE INDEX "Pensioner_createdBy_idx" ON "Pensioner"("createdBy");
