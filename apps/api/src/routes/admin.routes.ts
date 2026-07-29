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

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin());
adminRouter.get("/dashboard", dashboardStats);
adminRouter.get("/pensioners", listPensionersEnhanced);
adminRouter.post("/pensioners", createPensioner);
adminRouter.get("/pensioners/:id", getPensioner);
adminRouter.patch("/pensioners/:id", updatePensioner);
adminRouter.delete("/pensioners/:id", deletePensioner);
adminRouter.patch("/pensioners/:id/restore", restorePensioner);
adminRouter.patch("/pensioners/:id/status", changePensionerStatus);
adminRouter.post("/notifications", createNotification);
adminRouter.get("/notifications", listNotifications);
adminRouter.get("/notifications/:id", getNotification);
adminRouter.get("/grievances", listGrievances);
adminRouter.get("/grievances/:id", getGrievance);
adminRouter.patch("/grievances/:id", updateGrievance);
adminRouter.post("/grievances/:id/attachments", addGrievanceAttachment);
adminRouter.patch("/grievances/:id/reply", replyGrievance);
adminRouter.get("/audit-logs", listAuditLogs);
adminRouter.get("/search", globalSearch);

adminRouter.get("/pensioners/:id/detail", pensionerDetail);
adminRouter.patch("/pensioners/:id/extended", extendedUpdatePensioner);
adminRouter.post("/pensioners/import-csv", importPensionersCsv);
