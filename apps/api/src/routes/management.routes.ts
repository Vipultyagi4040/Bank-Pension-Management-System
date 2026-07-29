import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
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
managementRouter.use(requireAuth,requireAdmin());

managementRouter.post('/pensions',createPension);
managementRouter.post('/slips',createSlip);
managementRouter.get('/policies',listPolicies);
managementRouter.post('/policies',createPolicy);
managementRouter.patch('/policies/:id',updatePolicy);
managementRouter.delete('/policies/:id',deletePolicy);
managementRouter.get('/jeevan-pramaan',listJeevan);
managementRouter.post('/jeevan-pramaan',createJeevan);
managementRouter.patch('/jeevan-pramaan/:id',updateJeevan);
managementRouter.delete('/jeevan-pramaan/:id',deleteJeevan);
managementRouter.get('/reports/summary',reportSummary);
managementRouter.get('/reports/departments',getDepartmentReport);
managementRouter.get('/reports/export/csv',exportReportCsv);
managementRouter.get('/reports/export/pdf',exportReportPdf);

managementRouter.get('/pension-details', listPensionDetails);
managementRouter.get('/pension-details/:id', getPensionDetail);
managementRouter.post('/pension-details', createPensionDetail);
managementRouter.patch('/pension-details/:id', updatePensionDetail);
managementRouter.delete('/pension-details/:id', deletePensionDetail);

managementRouter.post('/process-monthly', processMonthlyPension);
managementRouter.get('/processing-history', getProcessingHistory);
managementRouter.get('/monthly-pensions', getMonthlyPensions);
managementRouter.patch('/monthly-pensions/:id/paid', markAsPaid);
managementRouter.get('/monthly-pensions/:id/slip', getPensionSlip);
managementRouter.get('/pensioners/:pensionerId/latest-slip', downloadLatestSlip);
managementRouter.get('/dashboard/stats', getDashboardStats);
