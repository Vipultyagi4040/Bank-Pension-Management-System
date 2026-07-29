import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

const createSchema = z.object({
  employeeId: z.string().min(2).max(50),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().nullable(),
  name: z.string().min(2).max(150),
  gender: z.string().max(20).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  maritalStatus: z.string().max(30).optional().nullable(),
  fatherName: z.string().max(150).optional().nullable(),
  panNumber: z.string().max(10).optional().nullable(),
  aadhaarNumber: z.string().max(20).optional().nullable(),
  bloodGroup: z.string().max(10).optional().nullable(),
  emergencyContactName: z.string().max(150).optional().nullable(),
  emergencyContactMobile: z.string().regex(/^[6-9]\d{9}$/).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  dateOfJoining: z.coerce.date().optional().nullable(),
  dateOfRetirement: z.coerce.date().optional().nullable(),
  pensionType: z.string().max(50).optional().nullable(),
  bankAccountNumber: z.string().max(30).optional().nullable(),
  bankIfscCode: z.string().max(20).optional().nullable(),
  bankAccountHolderName: z.string().max(150).optional().nullable(),
  bankBranchName: z.string().max(150).optional().nullable(),
  bankBranchAddress: z.string().max(300).optional().nullable(),
  bankAccountType: z.string().max(30).optional().nullable(),
  nomineeName: z.string().max(150).optional().nullable(),
  nomineeRelation: z.string().max(100).optional().nullable(),
  nomineeShare: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  profilePhotoUrl: z.string().url().optional().nullable(),
  idCardUrl: z.string().url().optional().nullable()
});

const updateSchema = createSchema.partial().extend({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED", "INACTIVE"])
    .optional()
});

export async function createPensioner(req: Request, res: Response) {
  const input = createSchema.parse(req.body);

  const existing = await prisma.pensioner.findFirst({
    where: {
      OR: [
        { employeeId: input.employeeId },
        { mobile: input.mobile }
      ]
    }
  });
  if (existing) {
    throw new HttpError(409, "Employee ID or mobile already exists");
  }

  const data = await prisma.pensioner.create({
    data: {
      ...input,
      createdBy: req.auth!.id,
      updatedBy: req.auth!.id
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSIONER_CREATED",
      entityType: "Pensioner",
      entityId: data.id,
      metadata: { employeeId: data.employeeId, name: data.name }
    }
  });

  res.status(201).json({ success: true, data });
}

export async function listPensioners(req: Request, res: Response) {
  const query = z.object({
    search: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED", "INACTIVE"]).optional(),
    department: z.string().optional(),
    gender: z.string().optional(),
    pensionType: z.string().optional(),
    deleted: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["createdAt", "name", "employeeId", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  }).parse(req.query);

  const where: Record<string, unknown> = {
    ...(query.deleted === "true" ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(query.status ? { status: query.status } : {}),
    ...(query.department ? { department: { contains: query.department, mode: "insensitive" as const } } : {}),
    ...(query.gender ? { gender: query.gender } : {}),
    ...(query.pensionType ? { pensionType: query.pensionType } : {})
  };

  if (query.search) {
    const search = query.search;
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { employeeId: { contains: search, mode: "insensitive" as const } },
      { mobile: { contains: search } },
      { email: { contains: search, mode: "insensitive" as const } },
      { aadhaarNumber: { contains: search } },
      { panNumber: { contains: search, mode: "insensitive" as const } },
      { department: { contains: search, mode: "insensitive" as const } },
      { designation: { contains: search, mode: "insensitive" as const } }
    ];
  }

  const orderBy: Record<string, string> = { [query.sortBy]: query.sortOrder };

  const [items, total] = await Promise.all([
    prisma.pensioner.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy,
      select: {
        id: true,
        employeeId: true,
        mobile: true,
        email: true,
        name: true,
        gender: true,
        department: true,
        designation: true,
        status: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        approvedAt: true,
        pensionDetails: {
          where: { isCurrent: true },
          take: 1,
          select: {
            pensionAmount: true,
            ppoNumber: true,
            category: true,
            bankName: true,
            effectiveFrom: true
          }
        }
      }
    }),
    prisma.pensioner.count({ where })
  ]);

  res.json({
    success: true,
    data: { items, total, page: query.page, limit: query.limit }
  });
}

export async function getPensioner(req: Request, res: Response) {
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
  const input = updateSchema.parse(req.body);

  const existing = await prisma.pensioner.findUnique({ where: { id } });
  if (!existing || existing.deletedAt !== null) {
    throw new HttpError(404, "Pensioner not found");
  }

  if (input.employeeId && input.employeeId !== existing.employeeId) {
    const duplicate = await prisma.pensioner.findFirst({
      where: { employeeId: input.employeeId, id: { not: id } }
    });
    if (duplicate) throw new HttpError(409, "Employee ID already exists");
  }

  if (input.mobile && input.mobile !== existing.mobile) {
    const duplicate = await prisma.pensioner.findFirst({
      where: { mobile: input.mobile, id: { not: id } }
    });
    if (duplicate) throw new HttpError(409, "Mobile number already exists");
  }

  const data = await prisma.pensioner.update({
    where: { id },
    data: {
      ...input,
      updatedBy: req.auth!.id,
      approvedAt: input.status === "APPROVED" ? new Date() : existing.approvedAt,
      approvedById: input.status === "APPROVED" ? req.auth!.id : existing.approvedById
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSIONER_UPDATED",
      entityType: "Pensioner",
      entityId: id,
      metadata: { employeeId: data.employeeId, changes: Object.keys(input) }
    }
  });

  res.json({ success: true, data });
}

export async function deletePensioner(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const existing = await prisma.pensioner.findUnique({ where: { id } });
  if (!existing || existing.deletedAt !== null) {
    throw new HttpError(404, "Pensioner not found");
  }

  await prisma.pensioner.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: req.auth!.id }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSIONER_DELETED",
      entityType: "Pensioner",
      entityId: id,
      metadata: { employeeId: existing.employeeId, name: existing.name }
    }
  });

  res.json({ success: true, message: "Pensioner deleted successfully" });
}

export async function restorePensioner(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const existing = await prisma.pensioner.findUnique({ where: { id } });
  if (!existing || existing.deletedAt === null) {
    throw new HttpError(404, "Pensioner not found or not deleted");
  }

  const data = await prisma.pensioner.update({
    where: { id },
    data: { deletedAt: null, updatedBy: req.auth!.id }
  });

  await prisma.auditLog.create({
    data: {
      adminId: req.auth!.id,
      action: "PENSIONER_RESTORED",
      entityType: "Pensioner",
      entityId: id,
      metadata: { employeeId: data.employeeId, name: data.name }
    }
  });

  res.json({ success: true, data });
}
