import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export async function createOtp(mobile: string) {
  const code = crypto.randomInt(100000, 999999).toString();

  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000);

  await prisma.otpCode.create({
    data: { mobile, codeHash, expiresAt }
  });

  // Replace this with MSG91/Twilio in production.
  if (env.NODE_ENV !== "production") {
    console.log(`[DEV OTP] ${mobile}: ${code}`);
  }

  return {
    expiresAt,
    developmentOtp: (env.NODE_ENV === "development" || env.OTP_DEMO_MODE === "true") ? code : undefined
  };
}

export async function verifyOtp(mobile: string, code: string) {
  const record = await prisma.otpCode.findFirst({
    where: {
      mobile,
      consumedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!record || !(await bcrypt.compare(code, record.codeHash))) {
    throw new HttpError(400, "Invalid or expired OTP");
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() }
  });
}
