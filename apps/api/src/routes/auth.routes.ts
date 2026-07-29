import { Router } from "express";
import {
  adminLogin,
  requestOtp,
  verifyPensionerOtp
} from "../controllers/auth.controller.js";
import { registerPensioner } from "../controllers/extended.controller.js";

export const authRouter = Router();

authRouter.post("/pensioner/request-otp", requestOtp);
authRouter.post("/pensioner/verify-otp", verifyPensionerOtp);
authRouter.post("/admin/login", adminLogin);

authRouter.post("/pensioner/register", registerPensioner);
