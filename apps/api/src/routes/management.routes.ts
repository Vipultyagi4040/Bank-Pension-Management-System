import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { apiCache } from "../middleware/cache.js";
import {
  createPension,
  createSlip,
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  listJeevan,
  createJeevan,
  updateJeevan,
  deleteJeevan,
  reportSummary
} from "../controllers/management.controller.js";
import {
  createPensionDetail,
  deletePensionDetail,
  getPensionDetail,
  listPensionDetails,
  updatePensionDetail
} from "../controllers/pension-detail.controller.js";
import {
  downloadLatestSlip,
  getDashboardStats,
  getMonthlyPensions,
  getPensionSlip,
  getProcessingHistory,
  markAsPaid,
  processMonthlyPension
} from "../controllers/monthly-pension.controller.js";
import {
  exportReportCsv,
  exportReportPdf,
  getDepartmentReport
} from "../controllers/report.controller.js";

export const managementRouter=Router();
managementRouter.use(requireAuth, requireAdmin("SUPER_ADMIN", "PENSION_MANAGER", "POLICY_MANAGER", "REPORT_VIEWER"));

managementRouter.post('/pensions',createPension);
managementRouter.post('/slips',createSlip);
managementRouter.get('/policies',apiCache(120),listPolicies);
managementRouter.post('/policies',createPolicy);
managementRouter.patch('/policies/:id',updatePolicy);
managementRouter.delete('/policies/:id',deletePolicy);
managementRouter.get('/jeevan-pramaan',apiCache(120),listJeevan);
managementRouter.post('/jeevan-pramaan',createJeevan);
managementRouter.patch('/jeevan-pramaan/:id',updateJeevan);
managementRouter.delete('/jeevan-pramaan/:id',deleteJeevan);
managementRouter.get('/reports/summary',apiCache(120),reportSummary);
managementRouter.get('/reports/departments',apiCache(120),getDepartmentReport);
managementRouter.get('/reports/export/csv',exportReportCsv);
managementRouter.get('/reports/export/pdf',exportReportPdf);

managementRouter.get('/pension-details',apiCache(120),listPensionDetails);
managementRouter.get('/pension-details/:id',apiCache(120),getPensionDetail);
managementRouter.post('/pension-details',createPensionDetail);
managementRouter.patch('/pension-details/:id',updatePensionDetail);
managementRouter.delete('/pension-details/:id',deletePensionDetail);

managementRouter.post('/process-monthly',processMonthlyPension);
managementRouter.get('/processing-history',apiCache(60),getProcessingHistory);
managementRouter.get('/monthly-pensions',apiCache(60),getMonthlyPensions);
managementRouter.patch('/monthly-pensions/:id/paid',markAsPaid);
managementRouter.get('/monthly-pensions/:id/slip',apiCache(60),getPensionSlip);
managementRouter.get('/pensioners/:pensionerId/latest-slip',apiCache(60),downloadLatestSlip);
managementRouter.get('/dashboard/stats',apiCache(60),getDashboardStats);
