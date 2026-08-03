import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import { env } from "../config/env.js";

const isDev = env.NODE_ENV === "development";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 50,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || "unknown")
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000,
  message: { success: false, message: "Rate limit exceeded. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || "unknown")
});
