import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function dashboardStats(_req: Request, res: Response) {
  const [
    total,
    pending,
    approved,
    openGrievances,
    pendingJeevanPramaan
  ] = await Promise.all([
    prisma.pensioner.count(),
    prisma.pensioner.count({ where: { status: "PENDING" } }),
    prisma.pensioner.count({ where: { status: "APPROVED" } }),
    prisma.grievance.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.jeevanPramaanRecord.count({
      where: { status: { in: ["NOT_SUBMITTED", "SUBMITTED"] } }
    })
  ]);

  res.json({
    success: true,
    data: { total, pending, approved, openGrievances, pendingJeevanPramaan }
  });
}

export async function changePensionerStatus(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { status } = z.object({
    status: z.enum(["APPROVED", "REJECTED", "SUSPENDED", "INACTIVE"])
  }).parse(req.body);

  const existing = await prisma.pensioner.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Pensioner not found");

  const updated = await prisma.pensioner.update({
    where: { id },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      approvedById: status === "APPROVED" ? req.auth!.id : null
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: `PENSIONER_${status}`,
      entityType: "Pensioner",
      entityId: id
    }
  });

  res.json({ success: true, data: updated });
}

export async function createNotification(req: Request, res: Response) {
  const input = z.object({
    title: z.string().min(3).max(150),
    message: z.string().min(5).max(3000),
    audience: z.enum(["ALL", "SELECTED"]).default("ALL"),
    pensionerIds: z.array(z.string()).default([])
  }).parse(req.body);

  if (input.audience === "SELECTED" && input.pensionerIds.length === 0) {
    throw new HttpError(400, "Select at least one pensioner");
  }

  const recipients = input.audience === "ALL"
    ? await prisma.pensioner.findMany({
        where: { status: "APPROVED" },
        select: { id: true }
      })
    : input.pensionerIds.map(id => ({ id }));

  const notification = await prisma.notification.create({
    data: {
      title: input.title,
      message: input.message,
      audience: input.audience,
      publishedAt: new Date(),
      createdById: req.auth!.id,
      receipts: {
        create: recipients.map(item => ({ pensionerId: item.id }))
      }
    }
  });

  res.status(201).json({ success: true, data: notification });
}

export async function listGrievances(req: Request, res: Response) {
  const query = z.object({
    search: z.string().optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "PENDING", "REJECTED", "SUSPENDED", "INACTIVE"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["createdAt", "subject", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  }).parse(req.query);

  const where: Record<string, unknown> = {};
  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: "insensitive" as const } },
      { description: { contains: query.search, mode: "insensitive" as const } },
      { assignedTo: { contains: query.search, mode: "insensitive" as const } },
      { pensioner: { name: { contains: query.search, mode: "insensitive" as const } } },
      { pensioner: { employeeId: { contains: query.search, mode: "insensitive" as const } } }
    ];
  }
  if (query.status) where.status = query.status;

  const orderBy: Record<string, string> = { [query.sortBy]: query.sortOrder };

  const [items, total] = await Promise.all([
    prisma.grievance.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy,
      include: {
        pensioner: {
          select: { id: true, employeeId: true, name: true, mobile: true }
        }
      }
    }),
    prisma.grievance.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function replyGrievance(req: Request, res: Response) {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const input = z.object({
    adminReply: z.string().min(3),
    status: z.enum(["IN_PROGRESS", "RESOLVED", "CLOSED"])
  }).parse(req.body);

  const existing = await prisma.grievance.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Grievance not found");

  const fromStatus = existing.status;
  const updated = await prisma.grievance.update({
    where: { id },
    data: input
  });

  if (input.status !== fromStatus) {
    await prisma.grievanceHistory.create({
      data: {
        grievanceId: id,
        action: "STATUS_CHANGED",
        fromStatus,
        toStatus: input.status,
        note: input.adminReply,
        performedBy: req.auth!.id
      }
    });
  }

  res.json({ success: true, data: updated });
}
