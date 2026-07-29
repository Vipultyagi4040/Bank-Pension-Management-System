import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("1d"),
  OTP_TTL_MINUTES: z.coerce.number().default(5),
  CORS_ORIGINS: z.string().default("http://localhost:5173")
});

export const env = schema.parse(process.env);
