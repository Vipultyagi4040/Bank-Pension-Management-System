import { Router } from "express";
import {
  changePensionerStatus,
  createNotification,
  dashboardStats,
  listGrievances,
  replyGrievance
} from "../controllers/admin.controller.js";
import {
  listNotifications,
  getNotification
} from "../controllers/notification.controller.js";
import {
  createPensioner,
  deletePensioner,
  getPensioner,
  listPensioners as listPensionersEnhanced,
  restorePensioner,
  updatePensioner
} from "../controllers/pensioner-management.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { importPensionersCsv, pensionerDetail, updatePensioner as extendedUpdatePensioner } from "../controllers/extended.controller.js";
import { listAuditLogs } from "../controllers/audit.controller.js";
import { globalSearch } from "../controllers/search.controller.js";
import {
  getGrievance,
  updateGrievance,
  addGrievanceAttachment
} from "../controllers/grievance.controller.js";
import { apiCache, clearCache } from "../middleware/cache.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin());
adminRouter.get("/dashboard", apiCache(60), dashboardStats);
adminRouter.get("/pensioners", apiCache(60), listPensionersEnhanced);
adminRouter.post("/pensioners", clearCache("/admin/pensioners"), createPensioner);
adminRouter.post("/pensioners/import-csv", clearCache("/admin/pensioners"), importPensionersCsv);
adminRouter.get("/pensioners/:id", apiCache(60), getPensioner);
adminRouter.patch("/pensioners/:id", clearCache("/admin/pensioners"), updatePensioner);
adminRouter.delete("/pensioners/:id", clearCache("/admin/pensioners"), deletePensioner);
adminRouter.patch("/pensioners/:id/restore", clearCache("/admin/pensioners"), requireAdmin("SUPER_ADMIN", "PENSION_MANAGER"), restorePensioner);
adminRouter.patch("/pensioners/:id/status", clearCache("/admin/pensioners"), requireAdmin("SUPER_ADMIN", "PENSION_MANAGER"), changePensionerStatus);
adminRouter.post("/notifications", createNotification);
adminRouter.get("/notifications", apiCache(60), listNotifications);
adminRouter.get("/notifications/:id", apiCache(60), getNotification);
adminRouter.get("/grievances", apiCache(60), listGrievances);
adminRouter.get("/grievances/:id", apiCache(60), getGrievance);
adminRouter.patch("/grievances/:id", clearCache("/admin/grievances"), updateGrievance);
adminRouter.post("/grievances/:id/attachments", clearCache("/admin/grievances"), addGrievanceAttachment);
adminRouter.patch("/grievances/:id/reply", clearCache("/admin/grievances"), replyGrievance);
adminRouter.get("/audit-logs", apiCache(30), listAuditLogs);
adminRouter.get("/search", apiCache(30), globalSearch);

adminRouter.get("/pensioners/:id/detail", apiCache(60), pensionerDetail);
adminRouter.patch("/pensioners/:id/extended", clearCache("/admin/pensioners"), extendedUpdatePensioner);
