import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export async function globalSearch(req: Request, res: Response) {
  const query = z.object({
    q: z.string().min(1),
    type: z.enum(["all", "pensioners", "grievances", "notifications"]).default("all"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(20).default(10)
  }).parse(req.query);

  const searchTerm = query.q;
  const results: Record<string, any[]> = {};

  if (query.type === "all" || query.type === "pensioners") {
    const pensioners = await prisma.pensioner.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" as const } },
          { employeeId: { contains: searchTerm, mode: "insensitive" as const } },
          { mobile: { contains: searchTerm } },
          { email: { contains: searchTerm, mode: "insensitive" as const } },
          { department: { contains: searchTerm, mode: "insensitive" as const } }
        ]
      },
      take: query.limit,
      select: { id: true, employeeId: true, name: true, mobile: true, department: true, status: true }
    });
    results.pensioners = pensioners;
  }

  if (query.type === "all" || query.type === "grievances") {
    const grievances = await prisma.grievance.findMany({
      where: {
        OR: [
          { subject: { contains: searchTerm, mode: "insensitive" as const } },
          { description: { contains: searchTerm, mode: "insensitive" as const } }
        ]
      },
      take: query.limit,
      include: { pensioner: { select: { name: true, employeeId: true } } }
    });
    results.grievances = grievances;
  }

  if (query.type === "all" || query.type === "notifications") {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" as const } },
          { message: { contains: searchTerm, mode: "insensitive" as const } }
        ]
      },
      take: query.limit,
      select: { id: true, title: true, message: true, createdAt: true }
    });
    results.notifications = notifications;
  }

  res.json({ success: true, data: results });
}
