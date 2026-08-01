import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function registerPensioner(req: Request, res: Response) {
  const input = z.object({
    employeeId: z.string().min(2),
    mobile: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional(),
    address: z.string().max(500).optional()
  }).parse(req.body);

  const record = await prisma.pensioner.findFirst({
    where: { employeeId: input.employeeId, mobile: input.mobile }
  });
  if (!record) throw new HttpError(404, "Employee ID and mobile do not match bank records");

  const updated = await prisma.pensioner.update({
    where: { id: record.id },
    data: {
      email: input.email,
      address: input.address,
      registrationCompleted: true,
      status: "PENDING"
    }
  });

  res.json({ success: true, message: "Registration submitted for approval", data: updated });
}

export async function pensionerDetail(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const data = await prisma.pensioner.findUnique({
    where: { id, deletedAt: null },
    include: {
      pensionDetails: { orderBy: { effectiveFrom: "desc" } },
      pensionSlips: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 10 },
      policies: { include: { policy: true }, take: 10 },
      grievances: { orderBy: { createdAt: "desc" }, take: 10 },
      jeevanPramaan: { orderBy: { createdAt: "desc" }, take: 5 },
      leads: { orderBy: { createdAt: "desc" }, take: 10 }
    }
  });
  if (!data) throw new HttpError(404, "Pensioner not found");
  res.json({ success: true, data });
}

export async function updatePensioner(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const input = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().nullable().optional(),
    department: z.string().nullable().optional(),
    designation: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    idCardUrl: z.string().url().nullable().optional()
  }).parse(req.body);
  const data = await prisma.pensioner.update({ where: { id }, data: input });
  res.json({ success: true, data });
}

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(x => x.trim());
  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map(x => x.trim());
    return { row: index + 2, data: Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])) };
  });
}

export async function importPensionersCsv(req: Request, res: Response) {
  const { csv } = z.object({ csv: z.string().min(1) }).parse(req.body);
  const rows = parseCsv(csv);
  const errors: Array<{ row: number; message: string }> = [];
  let imported = 0;

  for (const item of rows) {
    const d = item.data;
    if (!d.employeeId || !d.name || !/^[6-9]\d{9}$/.test(d.mobile || "")) {
      errors.push({ row: item.row, message: "employeeId, name and valid mobile are required" });
      continue;
    }
    try {
      await prisma.pensioner.upsert({
        where: { employeeId: d.employeeId },
        update: {
          name: d.name,
          mobile: d.mobile,
          email: d.email || null,
          department: d.department || null,
          designation: d.designation || null
        },
        create: {
          employeeId: d.employeeId,
          name: d.name,
          mobile: d.mobile,
          email: d.email || null,
          department: d.department || null,
          designation: d.designation || null,
          status: "INACTIVE"
        }
      });
      imported++;
    } catch (error) {
      errors.push({ row: item.row, message: error instanceof Error ? error.message : "Import failed" });
    }
  }
  res.json({ success: true, data: { imported, failed: errors.length, errors } });
}

export async function markNotificationRead(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const receipt = await prisma.notificationReceipt.findFirst({
    where: { id, pensionerId: req.auth!.id }
  });
  if (!receipt) throw new HttpError(404, "Notification not found");
  const data = await prisma.notificationReceipt.update({ where: { id }, data: { readAt: new Date() } });
  res.json({ success: true, data });
}

export async function acknowledgePolicy(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const assigned = await prisma.pensionerPolicy.findFirst({
    where: { id, pensionerId: req.auth!.id }
  });
  if (!assigned) throw new HttpError(404, "Policy assignment not found");
  const data = await prisma.pensionerPolicy.update({
    where: { id }, data: { acknowledgedAt: new Date(), consentGivenAt: new Date() }
  });
  res.json({ success: true, data });
}
