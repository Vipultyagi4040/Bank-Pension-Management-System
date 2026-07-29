import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function listAuditLogs(req: Request, res: Response) {
  const query = z.object({
    action: z.string().optional(),
    entityType: z.string().optional(),
    adminId: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }).parse(req.query);

  const where: Record<string, unknown> = {};
  if (query.action) where.action = { contains: query.action, mode: "insensitive" as const };
  if (query.entityType) where.entityType = query.entityType;
  if (query.adminId) where.adminId = query.adminId;
  if (query.startDate || query.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (query.startDate) dateFilter.gte = new Date(query.startDate);
    if (query.endDate) dateFilter.lte = new Date(query.endDate);
    where.createdAt = dateFilter;
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true, role: true } } }
    }),
    prisma.auditLog.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getMyActivity(req: Request, res: Response) {
  const query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).parse(req.query);

  const [items, total] = await Promise.all([
    prisma.userActivity.findMany({
      where: { pensionerId: req.auth!.id },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.userActivity.count({ where: { pensionerId: req.auth!.id } })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}
