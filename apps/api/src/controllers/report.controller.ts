import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function getReportSummary(_req: Request, res: Response) {
  const [users, leads, grievances, jeevan, policies, monthlyPensions] = await Promise.all([
    prisma.pensioner.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.grievance.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.jeevanPramaanRecord.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.policy.count(),
    prisma.monthlyPension.groupBy({
      by: ["month", "year"],
      _sum: { netAmount: true, grossAmount: true },
      orderBy: { year: "desc" },
      take: 12
    })
  ]);

  res.json({
    success: true,
    data: {
      users,
      leads,
      grievances,
      jeevan,
      policies,
      monthlyPensions,
      totalPensionDisbursed: monthlyPensions.reduce((sum, item) => sum + Number(item._sum.netAmount || 0), 0),
      totalGrossPension: monthlyPensions.reduce((sum, item) => sum + Number(item._sum.grossAmount || 0), 0)
    }
  });
}

export async function getDepartmentReport(req: Request, res: Response) {
  const query = z.object({
    department: z.string().optional(),
    year: z.coerce.number().int().optional()
  }).parse(req.query);

  const where: Record<string, unknown> = {};
  if (query.department) where.department = { contains: query.department, mode: "insensitive" as const };
  if (query.year) {
    const start = new Date(query.year, 0, 1);
    const end = new Date(query.year + 1, 0, 1);
    where.createdAt = { gte: start, lt: end };
  }

  const [departments, monthlyBreakdown] = await Promise.all([
    prisma.pensioner.groupBy({
      by: ["department"],
      where: { ...where, status: "APPROVED", deletedAt: null },
      _count: { _all: true }
    }),
    prisma.monthlyPension.findMany({
      where: query.year ? { year: query.year } : {},
      include: { pensioner: { select: { department: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    })
  ]);

  res.json({ success: true, data: { departments, monthlyBreakdown } });
}

export async function exportReportCsv(req: Request, res: Response) {
  const type = z.object({ type: z.enum(["pensioners", "monthly", "grievances"]) }).parse(req.query);

  let rows: string[][] = [];
  let filename = "report.csv";

  if (type.type === "pensioners") {
    filename = "pensioners.csv";
    rows = [["Employee ID", "Name", "Department", "Status", "Pension Amount", "Effective From"]];
    const data = await prisma.pensioner.findMany({
      where: { deletedAt: null },
      include: { pensionDetails: { where: { isCurrent: true }, take: 1 } },
      orderBy: { createdAt: "desc" }
    });
    for (const p of data) {
      const detail = p.pensionDetails[0];
      rows.push([
        p.employeeId,
        p.name,
        p.department || "",
        p.status,
        detail ? String(detail.pensionAmount) : "",
        detail ? detail.effectiveFrom.toISOString().slice(0, 10) : ""
      ]);
    }
  } else if (type.type === "monthly") {
    filename = "monthly-pensions.csv";
    rows = [["Month", "Year", "Employee ID", "Name", "Gross", "Deductions", "Net", "Status"]];
    const data = await prisma.monthlyPension.findMany({
      include: { pensioner: { select: { employeeId: true, name: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
    for (const m of data) {
      rows.push([
        String(m.month),
        String(m.year),
        m.pensioner.employeeId,
        m.pensioner.name,
        String(m.grossAmount),
        String(m.deductions),
        String(m.netAmount),
        m.status
      ]);
    }
  } else if (type.type === "grievances") {
    filename = "grievances.csv";
    rows = [["ID", "Pensioner", "Subject", "Status", "Created", "Admin Reply"]];
    const data = await prisma.grievance.findMany({
      include: { pensioner: { select: { name: true, employeeId: true } } },
      orderBy: { createdAt: "desc" }
    });
    for (const g of data) {
      rows.push([
        g.id,
        `${g.pensioner.name} (${g.pensioner.employeeId})`,
        g.subject,
        g.status,
        g.createdAt.toISOString(),
        g.adminReply || ""
      ]);
    }
  }

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(csv);
}

export async function exportReportPdf(req: Request, res: Response) {
  const type = z.object({ type: z.enum(["pensioners", "monthly", "grievances"]) }).parse(req.query);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Pension Management Report", { x: 180, y: 800, size: 18, font: boldFont, color: rgb(0.1, 0.3, 0.6) });
  page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: 180, y: 780, size: 10, font });

  let y = 750;
  const lineHeight = 16;

  if (type.type === "pensioners") {
    page.drawText("Pensioners Report", { x: 180, y, size: 14, font: boldFont });
    y -= lineHeight * 2;
    const data = await prisma.pensioner.findMany({
      where: { deletedAt: null },
      include: { pensionDetails: { where: { isCurrent: true }, take: 1 } },
      orderBy: { createdAt: "desc" }
    });
    for (const p of data) {
      if (y < 60) break;
      const detail = p.pensionDetails[0];
      page.drawText(`${p.employeeId} | ${p.name} | ${p.department || "-"} | ${p.status} | ${detail ? `Rs.${detail.pensionAmount}` : "-"}`, { x: 50, y, size: 9, font });
      y -= lineHeight;
    }
  } else if (type.type === "monthly") {
    page.drawText("Monthly Pension Report", { x: 180, y, size: 14, font: boldFont });
    y -= lineHeight * 2;
    const data = await prisma.monthlyPension.findMany({
      include: { pensioner: { select: { employeeId: true, name: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
    for (const m of data) {
      if (y < 60) break;
      page.drawText(`${m.month}/${m.year} | ${m.pensioner.employeeId} | ${m.pensioner.name} | Rs.${m.grossAmount} | Rs.${m.deductions} | Rs.${m.netAmount} | ${m.status}`, { x: 50, y, size: 9, font });
      y -= lineHeight;
    }
  } else if (type.type === "grievances") {
    page.drawText("Grievances Report", { x: 180, y, size: 14, font: boldFont });
    y -= lineHeight * 2;
    const data = await prisma.grievance.findMany({
      include: { pensioner: { select: { name: true, employeeId: true } } },
      orderBy: { createdAt: "desc" }
    });
    for (const g of data) {
      if (y < 60) break;
      page.drawText(`${g.id} | ${g.pensioner.name} (${g.pensioner.employeeId}) | ${g.subject} | ${g.status} | ${g.createdAt.toISOString()}`, { x: 50, y, size: 9, font });
      y -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${type.type}-report.pdf`);
  res.send(Buffer.from(pdfBytes));
}
