import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

const createSchema = z.object({
  subject: z.string().min(3).max(150),
  description: z.string().min(10).max(3000)
});

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  adminReply: z.string().max(3000).optional(),
  assignedTo: z.string().optional().nullable()
});

const attachmentSchema = z.object({
  filename: z.string().min(1),
  url: z.string().url(),
  contentType: z.string().optional().nullable(),
  size: z.number().int().nonnegative().optional().nullable()
});

export async function getGrievance(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const data = await prisma.grievance.findUnique({
    where: { id },
    include: {
      pensioner: { select: { id: true, employeeId: true, name: true, mobile: true } },
      attachments: { orderBy: { uploadedAt: "asc" } },
      history: { orderBy: { performedAt: "desc" } }
    }
  });
  if (!data) throw new HttpError(404, "Grievance not found");
  res.json({ success: true, data });
}

export async function createGrievance(req: Request, res: Response) {
  const input = createSchema.parse(req.body);
  const grievance = await prisma.grievance.create({
    data: {
      pensionerId: req.auth!.id,
      ...input
    }
  });

  await prisma.grievanceHistory.create({
    data: {
      grievanceId: grievance.id,
      action: "CREATED",
      toStatus: "OPEN",
      performedBy: req.auth!.id
    }
  });

  res.status(201).json({ success: true, data: grievance });
}

export async function updateGrievance(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const input = updateSchema.parse(req.body);

  const existing = await prisma.grievance.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Grievance not found");

  const fromStatus = existing.status;
  const toStatus = input.status || fromStatus;

  const updated = await prisma.grievance.update({
    where: { id },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.adminReply !== undefined ? { adminReply: input.adminReply } : {}),
      ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {})
    }
  });

  if (input.status && input.status !== fromStatus) {
    await prisma.grievanceHistory.create({
      data: {
        grievanceId: id,
        action: "STATUS_CHANGED",
        fromStatus,
        toStatus: input.status,
        note: input.adminReply || undefined,
        performedBy: req.auth!.id
      }
    });
  }

  res.json({ success: true, data: updated });
}

export async function addGrievanceAttachment(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const input = attachmentSchema.parse(req.body);

  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new HttpError(404, "Grievance not found");

  const attachment = await prisma.grievanceAttachment.create({
    data: {
      grievanceId: id,
      ...input
    }
  });

  await prisma.grievanceHistory.create({
    data: {
      grievanceId: id,
      action: "ATTACHMENT_ADDED",
      toStatus: grievance.status,
      note: `Attachment: ${input.filename}`,
      performedBy: req.auth!.id
    }
  });

  res.status(201).json({ success: true, data: attachment });
}

export async function getMyGrievances(req: Request, res: Response) {
  const data = await prisma.grievance.findMany({
    where: { pensionerId: req.auth!.id },
    orderBy: { createdAt: "desc" },
    include: {
      attachments: true,
      history: { orderBy: { performedAt: "desc" } }
    }
  });
  res.json({ success: true, data });
}

export async function getMyGrievance(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const data = await prisma.grievance.findFirst({
    where: { id, pensionerId: req.auth!.id },
    include: {
      attachments: { orderBy: { uploadedAt: "asc" } },
      history: { orderBy: { performedAt: "desc" } }
    }
  });
  if (!data) throw new HttpError(404, "Grievance not found");
  res.json({ success: true, data });
}
