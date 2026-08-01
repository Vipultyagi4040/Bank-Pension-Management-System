import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

const createSchema = z.object({
  title: z.string().min(3).max(150),
  message: z.string().min(5).max(3000),
  audience: z.enum(["ALL", "SELECTED"]).default("ALL"),
  pensionerIds: z.array(z.string()).default([])
});

export async function createNotification(req: Request, res: Response) {
  const input = createSchema.parse(req.body);

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

export async function listNotifications(req: Request, res: Response) {
  const query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    search: z.string().optional()
  }).parse(req.query);

  const where: Record<string, unknown> = {};
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" as const } },
      { message: { contains: query.search, mode: "insensitive" as const } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { receipts: true } }
      }
    }),
    prisma.notification.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getNotification(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const data = await prisma.notification.findUnique({
    where: { id },
    include: {
      _count: { select: { receipts: true } }
    }
  });
  if (!data) throw new HttpError(404, "Notification not found");
  res.json({ success: true, data });
}

export async function listMyNotifications(req: Request, res: Response) {
  const query = z.object({
    read: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).parse(req.query);

  const where: Record<string, unknown> = { pensionerId: req.auth!.id };
  if (query.read === "true") where.readAt = { not: null };
  if (query.read === "false") where.readAt = null;

  const [items, total] = await Promise.all([
    prisma.notificationReceipt.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { notification: { createdAt: "desc" } },
      include: { notification: true }
    }),
    prisma.notificationReceipt.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
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

export async function markAllNotificationsRead(_req: Request, res: Response) {
  await prisma.notificationReceipt.updateMany({
    where: { pensionerId: _req.auth!.id, readAt: null },
    data: { readAt: new Date() }
  });
  res.json({ success: true, message: "All notifications marked as read" });
}
