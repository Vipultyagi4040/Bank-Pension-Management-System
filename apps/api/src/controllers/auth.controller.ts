import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createOtp, verifyOtp } from "../services/otp.service.js";
import { signAccessToken } from "../utils/jwt.js";
import { HttpError } from "../utils/http-error.js";

const mobileSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/)
});

export async function requestOtp(req: Request, res: Response) {
  const { mobile } = mobileSchema.parse(req.body);

  const pensioner = await prisma.pensioner.findUnique({ where: { mobile } });
  if (!pensioner) {
    throw new HttpError(404, "Mobile number is not present in pensioner records");
  }

  const result = await createOtp(mobile);
  res.json({ success: true, message: "OTP sent", data: result });
}

export async function verifyPensionerOtp(req: Request, res: Response) {
  const { mobile, otp } = z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/),
    otp: z.string().length(6)
  }).parse(req.body);

  await verifyOtp(mobile, otp);

  const pensioner = await prisma.pensioner.findUnique({ where: { mobile } });
  if (!pensioner) throw new HttpError(404, "Pensioner not found");
  if (pensioner.status !== "APPROVED") {
    throw new HttpError(403, `Account status is ${pensioner.status}`);
  }

  const accessToken = signAccessToken({
    sub: pensioner.id,
    type: "PENSIONER"
  });

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: pensioner.id,
        employeeId: pensioner.employeeId,
        name: pensioner.name,
        mobile: pensioner.mobile
      }
    }
  });
}

export async function adminLogin(req: Request, res: Response) {
  const { email, password } = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }).parse(req.body);

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, "Invalid credentials");
  }

  const accessToken = signAccessToken({
    sub: admin.id,
    type: "ADMIN",
    role: admin.role
  });

  res.json({
    success: true,
    data: {
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
  });
}
