import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function getMyDashboard(req: Request, res: Response) {
  const pensionerId = req.auth!.id;

  const [pensioner, openGrievances, unreadNotifications] = await Promise.all([
    prisma.pensioner.findUnique({
      where: { id: pensionerId },
      include: {
        pensionDetails: {
          where: { isCurrent: true },
          take: 1
        },
        policies: {
          include: { policy: true },
          take: 5
        },
        jeevanPramaan: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    }),
    prisma.grievance.count({
      where: { pensionerId, status: { in: ["OPEN", "IN_PROGRESS"] } }
    }),
    prisma.notificationReceipt.count({
      where: { pensionerId, readAt: null }
    })
  ]);

  if (!pensioner) throw new HttpError(404, "Pensioner not found");

  res.json({
    success: true,
    data: {
      profile: pensioner,
      counters: { openGrievances, unreadNotifications }
    }
  });
}

export async function getMyProfile(req: Request, res: Response) {
  const user = await prisma.pensioner.findUnique({
    where: { id: req.auth!.id }
  });
  if (!user) throw new HttpError(404, "Pensioner not found");
  res.json({ success: true, data: user });
}

export async function updateMyProfile(req: Request, res: Response) {
  const input = z.object({
    email: z.string().email().optional(),
    address: z.string().max(500).optional()
  }).parse(req.body);

  const user = await prisma.pensioner.update({
    where: { id: req.auth!.id },
    data: input
  });
  res.json({ success: true, data: user });
}

export async function getMyPensionHistory(req: Request, res: Response) {
  const query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).parse(req.query);

  const where = { pensionerId: req.auth!.id };

  const [items, total] = await Promise.all([
    prisma.pensionDetail.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { effectiveFrom: "desc" }
    }),
    prisma.pensionDetail.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getMySlips(req: Request, res: Response) {
  const query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).parse(req.query);

  const where = { pensionerId: req.auth!.id };

  const [items, total] = await Promise.all([
    prisma.pensionSlip.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: [{ year: "desc" }, { month: "desc" }]
    }),
    prisma.pensionSlip.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getMyPolicies(req: Request, res: Response) {
  const data = await prisma.pensionerPolicy.findMany({
    where: { pensionerId: req.auth!.id },
    include: { policy: true }
  });
  res.json({ success: true, data });
}

export async function createLead(req: Request, res: Response) {
  const input = z.object({
    name: z.string().min(2),
    mobile: z.string().regex(/^[6-9]\d{9}$/),
    product: z.string().optional(),
    remarks: z.string().max(500).optional()
  }).parse(req.body);

  const lead = await prisma.lead.create({
    data: { pensionerId: req.auth!.id, ...input }
  });
  res.status(201).json({ success: true, data: lead });
}

export async function getMyLeads(req: Request, res: Response) {
  const query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).parse(req.query);

  const where = { pensionerId: req.auth!.id };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: "desc" } }),
    prisma.lead.count({ where })
  ]);
  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getMyJeevan(req: Request, res: Response) {
  const query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).parse(req.query);

  const where = { pensionerId: req.auth!.id };
  const [items, total] = await Promise.all([
    prisma.jeevanPramaanRecord.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: "desc" } }),
    prisma.jeevanPramaanRecord.count({ where })
  ]);
  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function createMyJeevan(req: Request, res: Response) {
  const input = z.object({
    applicationNumber: z.string().optional(),
    submissionDate: z.coerce.date().optional(),
    status: z.enum(["NOT_SUBMITTED", "SUBMITTED", "VERIFIED", "REJECTED", "EXPIRED"]).default("NOT_SUBMITTED"),
    remarks: z.string().optional()
  }).parse(req.body);

  const data = await prisma.jeevanPramaanRecord.create({
    data: { pensionerId: req.auth!.id, ...input }
  });
  res.status(201).json({ success: true, data });
}
