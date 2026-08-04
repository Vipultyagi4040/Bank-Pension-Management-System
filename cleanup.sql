DELETE FROM "Grievance" WHERE subject LIKE 'QA Test%' OR subject LIKE 'QA Test Pensioner%';
DELETE FROM "JeevanPramaanRecord" WHERE "applicationNumber" LIKE 'JEE-QA%' OR "applicationNumber" LIKE 'JEE-PEN-QA%';
DELETE FROM "Notification" WHERE title LIKE 'QA Test%' OR title LIKE 'QA Test Notification';
DELETE FROM "PensionerPolicy" WHERE "acknowledgedAt" > '2026-07-31T18:00:00';
DELETE FROM "MonthlyPension" WHERE "updatedAt" > '2026-07-31T18:00:00' AND status = 'PAID';
DELETE FROM "Lead" WHERE name LIKE 'QA Lead%';
DELETE FROM "Policy" WHERE "policyNumber" = 'POL-QA-001';
DELETE FROM "AuditLog" WHERE "createdAt" > '2026-07-31T18:00:00' AND ("action" LIKE 'POLICY%' OR "action" LIKE 'JEVAN%' OR "action" LIKE 'MONTHLY%' OR "action" LIKE 'SLIP%' OR "action" LIKE 'PROCESSING%' OR "action" LIKE 'PENSION_DETAIL%');
DELETE FROM "PensionProcessingLog" WHERE "startedAt" > '2026-07-31T18:00:00';
DELETE FROM "PensionSlip" WHERE "createdAt" > '2026-07-31T18:00:00';
DELETE FROM "Pensioner" WHERE "employeeId" = 'EMP-REG-001' OR ("createdAt" > '2026-07-31T18:00:00' AND "employeeId" LIKE 'EMP%REG%');
DELETE FROM "PensionDetail" WHERE "ppoNumber" LIKE 'PPO-QA%';
DELETE FROM "OtpCode" WHERE "createdAt" > '2026-07-31T18:00:00';
DELETE FROM "UserActivity" WHERE "action" LIKE 'PROFILE_UPDATED%';

-- Count remaining records
SELECT 'Admin' as table_name, COUNT(*) as count FROM "Admin"
UNION ALL SELECT 'Pensioner', COUNT(*) FROM "Pensioner" WHERE "deletedAt" IS NULL
UNION ALL SELECT 'PensionDetail', COUNT(*) FROM "PensionDetail"
UNION ALL SELECT 'MonthlyPension', COUNT(*) FROM "MonthlyPension"
UNION ALL SELECT 'PensionSlip', COUNT(*) FROM "PensionSlip"
UNION ALL SELECT 'Grievance', COUNT(*) FROM "Grievance"
UNION ALL SELECT 'Notification', COUNT(*) FROM "Notification"
UNION ALL SELECT 'NotificationReceipt', COUNT(*) FROM "NotificationReceipt"
UNION ALL SELECT 'Policy', COUNT(*) FROM "Policy"
UNION ALL SELECT 'PensionerPolicy', COUNT(*) FROM "PensionerPolicy"
UNION ALL SELECT 'JeevanPramaanRecord', COUNT(*) FROM "JeevanPramaanRecord"
UNION ALL SELECT 'AuditLog', COUNT(*) FROM "AuditLog"
UNION ALL SELECT 'Lead', COUNT(*) FROM "Lead"
UNION ALL SELECT 'UserActivity', COUNT(*) FROM "UserActivity"
UNION ALL SELECT 'OtpCode', COUNT(*) FROM "OtpCode"
UNION ALL SELECT 'PensionProcessingLog', COUNT(*) FROM "PensionProcessingLog";
