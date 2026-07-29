import { Router } from "express";
import {
  createLead,
  createMyJeevan,
  getMyDashboard,
  getMyGrievances,
  getMyJeevan,
  getMyLeads,
  getMyPensionHistory,
  getMyPolicies,
  getMyProfile,
  getMySlips,
  updateMyProfile
} from "../controllers/pensioner.controller.js";
import {
  createGrievance,
  getMyGrievance
} from "../controllers/grievance.controller.js";
import {
  listMyNotifications,
  markAllNotificationsRead
} from "../controllers/notification.controller.js";
import { requireAuth, requirePensioner } from "../middleware/auth.js";
import { acknowledgePolicy, markNotificationRead } from "../controllers/extended.controller.js";
import { downloadMySlip } from "../controllers/monthly-pension.controller.js";
import { getMyActivity } from "../controllers/audit.controller.js";

export const pensionerRouter = Router();

pensionerRouter.use(requireAuth, requirePensioner);
pensionerRouter.get("/dashboard", getMyDashboard);
pensionerRouter.get("/profile", getMyProfile);
pensionerRouter.patch("/profile", updateMyProfile);
pensionerRouter.get("/pension", getMyPensionHistory);
pensionerRouter.get("/slips", getMySlips);
pensionerRouter.get("/slips/:id/download", downloadMySlip);
pensionerRouter.get("/policies", getMyPolicies);
pensionerRouter.get("/notifications", listMyNotifications);
pensionerRouter.patch("/notifications/:id/read", markNotificationRead);
pensionerRouter.patch("/notifications/read-all", markAllNotificationsRead);
pensionerRouter.get("/grievances", getMyGrievances);
pensionerRouter.get("/grievances/:id", getMyGrievance);
pensionerRouter.post("/grievances", createGrievance);
pensionerRouter.post("/leads", createLead);
pensionerRouter.get("/leads", getMyLeads);
pensionerRouter.get("/jeevan", getMyJeevan);
pensionerRouter.post("/jeevan", createMyJeevan);
pensionerRouter.patch("/policies/:id/acknowledge", acknowledgePolicy);
pensionerRouter.get("/activity", getMyActivity);
