import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

const createSchema = z.object({
  pensionerId: z.string().min(1),
  ppoNumber: z.string().min(1),
  category: z.string().optional().nullable(),
  pensionType: z.string().optional().nullable(),
  basicPension: z.coerce.number().nonnegative(),
  da: z.coerce.number().nonnegative().default(0),
  hra: z.coerce.number().nonnegative().default(0),
  medicalAllowance: z.coerce.number().nonnegative().default(0),
  otherAllowances: z.coerce.number().nonnegative().default(0),
  deductions: z.coerce.number().nonnegative().default(0),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  bankName: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  accountLastFour: z.string().length(4).optional().nullable(),
  isCurrent: z.boolean().default(true),
  status: z.string().default("ACTIVE")
});

const updateSchema = createSchema.partial();

export async function listPensionDetails(req: Request, res: Response) {
  const query = z.object({
    pensionerId: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }).parse(req.query);

  const where: Record<string, unknown> = {
    ...(query.pensionerId ? { pensionerId: query.pensionerId } : {}),
    ...(query.status ? { status: query.status } : {})
  };

  if (query.search) {
    where.OR = [
      { ppoNumber: { contains: query.search, mode: "insensitive" as const } },
      { bankName: { contains: query.search, mode: "insensitive" as const } },
      { branchName: { contains: query.search, mode: "insensitive" as const } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.pensionDetail.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { effectiveFrom: "desc" },
      include: { pensioner: { select: { employeeId: true, name: true, mobile: true } } }
    }),
    prisma.pensionDetail.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getPensionDetail(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const data = await prisma.pensionDetail.findUnique({
    where: { id },
    include: { pensioner: true }
  });
  if (!data) throw new HttpError(404, "Pension detail not found");
  res.json({ success: true, data });
}

export async function createPensionDetail(req: Request, res: Response) {
  const input = createSchema.parse(req.body);

  const existing = await prisma.pensionDetail.findFirst({
    where: { ppoNumber: input.ppoNumber }
  });
  if (existing) throw new HttpError(409, "PPO Number already exists");

  if (input.isCurrent) {
    await prisma.pensionDetail.updateMany({
      where: { pensionerId: input.pensionerId, isCurrent: true },
      data: { isCurrent: false, effectiveTo: new Date() }
    });
  }

  const totalPension =
    (input.basicPension || 0) +
    (input.da || 0) +
    (input.hra || 0) +
    (input.medicalAllowance || 0) +
    (input.otherAllowances || 0) -
    (input.deductions || 0);

  const data = await prisma.pensionDetail.create({
    data: {
      ...input,
      totalPension,
      pensionAmount: totalPension
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSION_DETAIL_CREATED",
      entityType: "PensionDetail",
      entityId: data.id,
      metadata: { pensionerId: input.pensionerId, ppoNumber: input.ppoNumber }
    }
  });

  res.status(201).json({ success: true, data });
}

export async function updatePensionDetail(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const input = updateSchema.parse(req.body);

  const existing = await prisma.pensionDetail.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Pension detail not found");

  if (input.ppoNumber && input.ppoNumber !== existing.ppoNumber) {
    const duplicate = await prisma.pensionDetail.findFirst({
      where: { ppoNumber: input.ppoNumber, id: { not: id } }
    });
    if (duplicate) throw new HttpError(409, "PPO Number already exists");
  }

  if (input.isCurrent) {
    await prisma.pensionDetail.updateMany({
      where: { pensionerId: existing.pensionerId, isCurrent: true, id: { not: id } },
      data: { isCurrent: false, effectiveTo: new Date() }
    });
  }

  const basicPension = input.basicPension ?? existing.basicPension;
  const da = input.da ?? existing.da;
  const hra = input.hra ?? existing.hra;
  const medicalAllowance = input.medicalAllowance ?? existing.medicalAllowance;
  const otherAllowances = input.otherAllowances ?? existing.otherAllowances;
  const deductions = input.deductions ?? existing.deductions;

  const totalPension =
    Number(basicPension || 0) +
    Number(da || 0) +
    Number(hra || 0) +
    Number(medicalAllowance || 0) +
    Number(otherAllowances || 0) -
    Number(deductions || 0);

  const data = await prisma.pensionDetail.update({
    where: { id },
    data: {
      ...input,
      totalPension,
      pensionAmount: totalPension
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSION_DETAIL_UPDATED",
      entityType: "PensionDetail",
      entityId: id,
      metadata: { pensionerId: existing.pensionerId }
    }
  });

  res.json({ success: true, data });
}

export async function deletePensionDetail(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const existing = await prisma.pensionDetail.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Pension detail not found");

  await prisma.pensionDetail.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSION_DETAIL_DELETED",
      entityType: "PensionDetail",
      entityId: id,
      metadata: { pensionerId: existing.pensionerId, ppoNumber: existing.ppoNumber }
    }
  });

  res.json({ success: true, message: "Pension detail deleted" });
}
