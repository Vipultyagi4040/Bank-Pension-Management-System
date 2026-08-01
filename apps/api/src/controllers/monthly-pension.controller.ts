import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

const processSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  pensionerIds: z.array(z.string()).optional().default([])
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSED", "PAID", "FAILED"])
});

export async function processMonthlyPension(req: Request, res: Response) {
  const input = processSchema.parse(req.body);
  const { month, year, pensionerIds } = input;

  const existingLog = await prisma.pensionProcessingLog.findFirst({
    where: { month, year, status: { in: ["RUNNING", "COMPLETED"] } }
  });
  if (existingLog) {
    throw new HttpError(400, `Processing for ${month}/${year} already ${existingLog.status}`);
  }

  const log = await prisma.pensionProcessingLog.create({
    data: { month, year, totalPensioners: 0, processedCount: 0, failedCount: 0, status: "RUNNING", processedById: req.auth!.id }
  });

  try {
    const pensioners = await prisma.pensioner.findMany({
      where: {
        status: "APPROVED",
        deletedAt: null,
        ...(pensionerIds.length > 0 ? { id: { in: pensionerIds } } : {})
      },
      include: {
        pensionDetails: {
          where: { isCurrent: true, status: "ACTIVE" },
          take: 1
        }
      }
    });

    let processedCount = 0;
    let failedCount = 0;

    for (const pensioner of pensioners) {
      const detail = pensioner.pensionDetails[0];
      if (!detail) {
        failedCount++;
        continue;
      }

      const existing = await prisma.monthlyPension.findUnique({
        where: { pensionerId_month_year: { pensionerId: pensioner.id, month, year } }
      });
      if (existing) {
        failedCount++;
        continue;
      }

      const basicPension = Number(detail.basicPension || 0);
      const da = Number(detail.da || 0);
      const hra = Number(detail.hra || 0);
      const medicalAllowance = Number(detail.medicalAllowance || 0);
      const otherAllowances = Number(detail.otherAllowances || 0);
      const deductions = Number(detail.deductions || 0);
      const grossAmount = basicPension + da + hra + medicalAllowance + otherAllowances;
      const netAmount = grossAmount - deductions;

      await prisma.monthlyPension.create({
        data: {
          pensionerId: pensioner.id,
          pensionDetailId: detail.id,
          month,
          year,
          basicPension,
          da,
          hra,
          medicalAllowance,
          otherAllowances,
          grossAmount,
          deductions,
          netAmount,
          status: "PROCESSED"
        }
      });

      await prisma.pensionSlip.create({
        data: {
          pensionerId: pensioner.id,
          month,
          year,
          basicPension,
          da,
          hra,
          medicalAllowance,
          otherAllowances,
          grossAmount,
          deductions,
          netAmount
        }
      });

      processedCount++;
    }

    await prisma.pensionProcessingLog.update({
      where: { id: log.id },
      data: { status: "COMPLETED", completedAt: new Date(), totalPensioners: pensioners.length, processedCount, failedCount }
    });

    res.json({ success: true, message: `Processed ${processedCount} pensioners`, data: { processedCount, failedCount, total: pensioners.length } });
  } catch (error) {
    await prisma.pensionProcessingLog.update({
      where: { id: log.id },
      data: { status: "FAILED", completedAt: new Date(), errorMessage: error instanceof Error ? error.message : "Unknown error" }
    });
    throw error;
  }
}

export async function getProcessingHistory(req: Request, res: Response) {
  const query = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(50).default(10) }).parse(req.query);
  const [items, total] = await Promise.all([
    prisma.pensionProcessingLog.findMany({ orderBy: { startedAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.pensionProcessingLog.count()
  ]);
  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function getMonthlyPensions(req: Request, res: Response) {
  const query = z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
    status: z.string().optional(),
    pensionerId: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }).parse(req.query);

  const where: Record<string, unknown> = {
    ...(query.month ? { month: query.month } : {}),
    ...(query.year ? { year: query.year } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.pensionerId ? { pensionerId: query.pensionerId } : {})
  };

  const [items, total] = await Promise.all([
    prisma.monthlyPension.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { pensioner: { select: { employeeId: true, name: true, mobile: true, department: true, designation: true } } }
    }),
    prisma.monthlyPension.count({ where })
  ]);

  res.json({ success: true, data: { items, total, page: query.page, limit: query.limit } });
}

export async function markAsPaid(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const existing = await prisma.monthlyPension.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Monthly pension record not found");
  const data = await prisma.monthlyPension.update({ where: { id }, data: { status: "PAID", paymentDate: new Date() } });
  res.json({ success: true, data });
}

export async function getPensionSlip(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const record = await prisma.monthlyPension.findUnique({
    where: { id },
    select: {
      id: true, month: true, year: true, basicPension: true, da: true, hra: true,
      medicalAllowance: true, otherAllowances: true, grossAmount: true, deductions: true,
      netAmount: true, pensioner: { select: { employeeId: true, name: true, mobile: true, department: true, designation: true } },
      pensionDetail: { select: { bankName: true, branchName: true, accountLastFour: true, ppoNumber: true } }
    }
  });
  if (!record) throw new HttpError(404, "Monthly pension record not found");

  const pdf = await generatePensionSlipPdf({
    pensioner: record.pensioner,
    month: record.month,
    year: record.year,
    basicPension: Number(record.basicPension),
    da: Number(record.da),
    hra: Number(record.hra),
    medicalAllowance: Number(record.medicalAllowance),
    otherAllowances: Number(record.otherAllowances),
    grossAmount: Number(record.grossAmount),
    deductions: Number(record.deductions),
    netAmount: Number(record.netAmount),
    pensionDetail: record.pensionDetail
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="pension-slip-${record.pensioner.employeeId}-${record.month}-${record.year}.pdf"`);
  res.send(Buffer.from(await pdf.save()));
}

export async function downloadMySlip(req: Request, res: Response) {
  const id = z.string().parse(req.params.id);
  const record = await prisma.pensionSlip.findFirst({
    where: { id, pensionerId: req.auth!.id },
    select: {
      id: true, pensionerId: true, month: true, year: true, basicPension: true, da: true, hra: true,
      medicalAllowance: true, otherAllowances: true, grossAmount: true, deductions: true,
      netAmount: true, pensioner: { select: { employeeId: true, name: true, mobile: true, department: true, designation: true } }
    }
  });
  if (!record) throw new HttpError(404, "Pension slip not found");

  const pensionDetail = await prisma.pensionDetail.findFirst({
    where: { pensionerId: record.pensionerId, isCurrent: true },
    orderBy: { effectiveFrom: "desc" },
    select: { bankName: true, branchName: true, accountLastFour: true, ppoNumber: true }
  });

  const pdf = await generatePensionSlipPdf({
    pensioner: record.pensioner,
    month: record.month,
    year: record.year,
    basicPension: Number(record.basicPension),
    da: Number(record.da),
    hra: Number(record.hra),
    medicalAllowance: Number(record.medicalAllowance),
    otherAllowances: Number(record.otherAllowances),
    grossAmount: Number(record.grossAmount),
    deductions: Number(record.deductions),
    netAmount: Number(record.netAmount),
    pensionDetail: pensionDetail || null
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="pension-slip-${record.pensioner.employeeId}-${record.month}-${record.year}.pdf"`);
  res.send(Buffer.from(await pdf.save()));
}

export async function downloadLatestSlip(req: Request, res: Response) {
  const pensionerId = z.string().parse(req.params.pensionerId);
  const record = await prisma.monthlyPension.findFirst({
    where: { pensionerId, status: { in: ["PROCESSED", "PAID"] } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: {
      id: true, month: true, year: true, basicPension: true, da: true, hra: true,
      medicalAllowance: true, otherAllowances: true, grossAmount: true, deductions: true,
      netAmount: true, pensioner: { select: { employeeId: true, name: true, mobile: true, department: true, designation: true } },
      pensionDetail: { select: { bankName: true, branchName: true, accountLastFour: true, ppoNumber: true } }
    }
  });
  if (!record) throw new HttpError(404, "No pension slip available");

  const pdf = await generatePensionSlipPdf({
    pensioner: record.pensioner,
    month: record.month,
    year: record.year,
    basicPension: Number(record.basicPension),
    da: Number(record.da),
    hra: Number(record.hra),
    medicalAllowance: Number(record.medicalAllowance),
    otherAllowances: Number(record.otherAllowances),
    grossAmount: Number(record.grossAmount),
    deductions: Number(record.deductions),
    netAmount: Number(record.netAmount),
    pensionDetail: record.pensionDetail
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="pension-slip-${record.pensioner.employeeId}-${record.month}-${record.year}.pdf"`);
  res.send(Buffer.from(await pdf.save()));
}

async function generatePensionSlipPdf(record: { pensioner: any; month: number; year: number; basicPension: number; da: number; hra: number; medicalAllowance: number; otherAllowances: number; grossAmount: number; deductions: number; netAmount: number; pensionDetail: any }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const qrData = `PENSION|${record.pensioner.employeeId}|${record.month}/${record.year}|${record.netAmount}`;
  const qrUrl = await QRCode.toDataURL(qrData, { width: 80, margin: 1 });
  const qrImage = await pdfDoc.embedPng(qrUrl);

  let y = 40;
  const centerX = 297.64;

  page.drawText("GOVERNMENT PENSION SLIP", { x: centerX - 100, y: 800, size: 18, font: boldFont, color: rgb(0.1, 0.3, 0.6) });
  page.drawText(`Month: ${record.month.toString().padStart(2, "0")}/${record.year}`, { x: centerX - 40, y: 775, size: 12, font });
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, { x: centerX - 50, y: 760, size: 10, font });

  y = 720;
  drawBox(page, 40, y, 515, 120);
  page.drawText("PENSIONER DETAILS", { x: 50, y: y + 100, size: 11, font: boldFont });
  const pensionerDetails = [
    ["Employee ID", record.pensioner.employeeId],
    ["Name", record.pensioner.name],
    ["Mobile", record.pensioner.mobile],
    ["Department", record.pensioner.department || "-"],
    ["Designation", record.pensioner.designation || "-"]
  ];
  pensionerDetails.forEach(([label, value], i) => {
    const rowY = y + 80 - i * 18;
    page.drawText(`${label}:`, { x: 50, y: rowY, size: 10, font: boldFont });
    page.drawText(String(value), { x: 160, y: rowY, size: 10, font });
  });

  y = 580;
  drawBox(page, 40, y, 515, 180);
  page.drawText("PENSION BREAKDOWN", { x: 50, y: y + 160, size: 11, font: boldFont });
  const breakdown: Array<[string, number]> = [
    ["Basic Pension", record.basicPension],
    ["DA", record.da],
    ["HRA", record.hra],
    ["Medical Allowance", record.medicalAllowance],
    ["Other Allowances", record.otherAllowances],
    ["Gross Amount", record.grossAmount],
    ["Deductions", record.deductions]
  ];
  breakdown.forEach(([label, value], i) => {
    const rowY = y + 140 - i * 18;
    page.drawText(label, { x: 50, y: rowY, size: 10, font });
    page.drawText(`Rs.${value.toFixed(2)}`, { x: 400, y: rowY, size: 10, font: boldFont });
  });

  y = 380;
  drawBox(page, 40, y, 515, 80);
  page.drawText("NET PENSION", { x: 50, y: y + 55, size: 12, font: boldFont, color: rgb(0, 0.5, 0) });
  page.drawText(`Rs.${record.netAmount.toFixed(2)}`, { x: 350, y: y + 55, size: 14, font: boldFont });

  if (record.pensionDetail) {
    y = 280;
    drawBox(page, 40, y, 515, 100);
    page.drawText("BANK DETAILS", { x: 50, y: y + 80, size: 11, font: boldFont });
    const bankDetails = [
      ["Bank Name", record.pensionDetail.bankName || "-"],
      ["Branch", record.pensionDetail.branchName || "-"],
      ["Account Last Four", record.pensionDetail.accountLastFour || "-"],
      ["PPO Number", record.pensionDetail.ppoNumber]
    ];
    bankDetails.forEach(([label, value], i) => {
      const rowY = y + 60 - i * 16;
      page.drawText(`${label}:`, { x: 50, y: rowY, size: 9, font: boldFont });
      page.drawText(value, { x: 160, y: rowY, size: 9, font });
    });
  }

  page.drawImage(qrImage, { x: 460, y: 100, width: 80, height: 80 });
  page.drawText("Scan to verify", { x: 455, y: 85, size: 8, font });
  page.drawText("Digital Signature", { x: 50, y: 85, size: 9, font: boldFont });
  page.drawLine({ start: { x: 50, y: 70 }, end: { x: 200, y: 70 }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });

  return pdfDoc;
}

function drawBox(page: any, x: number, y: number, width: number, height: number) {
  page.drawRectangle({ x, y, width, height, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 1 });
}

export async function getDashboardStats(_req: Request, res: Response) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [totalPensioners, monthlyStats, monthlyTrend] = await Promise.all([
    prisma.pensioner.count({ where: { status: "APPROVED", deletedAt: null } }),
    prisma.monthlyPension.groupBy({
      by: ["status"],
      where: { month: currentMonth, year: currentYear },
      _count: { _all: true },
      _sum: { netAmount: true }
    }),
    prisma.monthlyPension.groupBy({
      by: ["month", "year"],
      where: { year: currentYear },
      _sum: { netAmount: true },
      orderBy: { month: "asc" }
    })
  ]);

  const totalPaid = monthlyStats.find(s => s.status === "PAID")?._count._all ?? 0;
  const pendingPayments = monthlyStats
    .filter(s => s.status === "PENDING" || s.status === "PROCESSED")
    .reduce((sum, s) => sum + (s._count._all || 0), 0);
  const currentMonthProcessed = monthlyStats.reduce((sum, s) => sum + (s._count._all || 0), 0);
  const totalMonthlyPension = monthlyStats.reduce((sum, s) => sum + Number(s._sum.netAmount || 0), 0);

  const monthlyData = monthlyTrend.map(item => ({
    month: `${item.month.toString().padStart(2, "0")}/${item.year}`,
    amount: Number(item._sum.netAmount || 0)
  }));

  res.json({
    success: true,
    data: {
      totalPensioners,
      totalMonthlyPension,
      totalPaid,
      pendingPayments,
      currentMonthProcessed,
      monthlyTrend: monthlyData
    }
  });
}
