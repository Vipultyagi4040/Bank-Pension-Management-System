-- AlterTable
ALTER TABLE "Grievance" ADD COLUMN     "assignedTo" TEXT;

-- CreateTable
CREATE TABLE "GrievanceAttachment" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" TEXT,
    "size" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrievanceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrievanceHistory" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "GrievanceStatus",
    "toStatus" "GrievanceStatus",
    "note" TEXT,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrievanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrievanceAttachment_grievanceId_idx" ON "GrievanceAttachment"("grievanceId");

-- CreateIndex
CREATE INDEX "GrievanceHistory_grievanceId_idx" ON "GrievanceHistory"("grievanceId");

-- AddForeignKey
ALTER TABLE "GrievanceAttachment" ADD CONSTRAINT "GrievanceAttachment_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceHistory" ADD CONSTRAINT "GrievanceHistory_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
