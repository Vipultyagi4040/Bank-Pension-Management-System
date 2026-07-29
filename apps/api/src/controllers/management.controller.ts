import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export async function createPension(req: Request, res: Response) {
  try {
    const x=z.object({pensionerId:z.string(),ppoNumber:z.string(),category:z.string().optional(),pensionAmount:z.coerce.number().positive(),effectiveFrom:z.coerce.date(),bankName:z.string().optional(),branchName:z.string().optional(),accountLastFour:z.string().length(4).optional()}).parse(req.body);
    await prisma.pensionDetail.updateMany({where:{pensionerId:x.pensionerId,isCurrent:true},data:{isCurrent:false,effectiveTo:new Date()}});
    const data=await prisma.pensionDetail.create({data:{...x,pensionAmount:x.pensionAmount,isCurrent:true}});res.status(201).json({success:true,data});
  } catch (error) {
    if (error instanceof z.ZodError) throw new HttpError(400, error.issues?.[0]?.message || "Validation failed");
    throw error;
  }
}

export async function createSlip(req: Request, res: Response) {
  try {
    const x=z.object({pensionerId:z.string(),month:z.number().int().min(1).max(12),year:z.number().int().min(2000),basicPension:z.coerce.number().nonnegative(),da:z.coerce.number().nonnegative(),hra:z.coerce.number().nonnegative(),medicalAllowance:z.coerce.number().nonnegative(),otherAllowances:z.coerce.number().nonnegative(),grossAmount:z.coerce.number().nonnegative(),deductions:z.coerce.number().nonnegative(),netAmount:z.coerce.number().nonnegative(),documentUrl:z.string().url().optional()}).parse(req.body);
    const data=await prisma.pensionSlip.upsert({where:{pensionerId_month_year:{pensionerId:x.pensionerId,month:x.month,year:x.year}},update:x,create:x});res.status(201).json({success:true,data});
  } catch (error) {
    if (error instanceof z.ZodError) throw new HttpError(400, error.issues?.[0]?.message || "Validation failed");
    throw error;
  }
}

export async function listPolicies(_req:Request,res:Response){res.json({success:true,data:await prisma.policy.findMany({orderBy:{createdAt:"desc"}})});}
export async function createPolicy(req:Request,res:Response){try{const x=z.object({policyNumber:z.string(),title:z.string(),coverageDetails:z.string().optional(),claimGuidelines:z.string().optional(),validFrom:z.coerce.date(),validTo:z.coerce.date(),documentUrl:z.string().url().optional(),consentRequired:z.boolean().default(false),isPublished:z.boolean().default(false)}).parse(req.body);res.status(201).json({success:true,data:await prisma.policy.create({data:x})});}catch(error){if(error instanceof z.ZodError) throw new HttpError(400,error.issues?.[0]?.message||"Validation failed");throw error;}}
export async function updatePolicy(req:Request,res:Response){try{const id=z.string().parse(req.params.id);const x=z.object({policyNumber:z.string().optional(),title:z.string().optional(),coverageDetails:z.string().optional(),claimGuidelines:z.string().optional(),validFrom:z.coerce.date().optional(),validTo:z.coerce.date().optional(),documentUrl:z.string().url().optional(),consentRequired:z.boolean().optional(),isPublished:z.boolean().optional()}).parse(req.body);res.json({success:true,data:await prisma.policy.update({where:{id},data:x})});}catch(error){if(error instanceof z.ZodError) throw new HttpError(400,error.issues?.[0]?.message||"Validation failed");throw error;}}
export async function deletePolicy(req:Request,res:Response){const id=z.string().parse(req.params.id);await prisma.policy.delete({where:{id}});res.json({success:true,message:"Policy deleted"});}
export async function listJeevan(_req:Request,res:Response){res.json({success:true,data:await prisma.jeevanPramaanRecord.findMany({include:{pensioner:{select:{employeeId:true,name:true,mobile:true}}},orderBy:{createdAt:"desc"}})});}
export async function createJeevan(req:Request,res:Response){try{const x=z.object({pensionerId:z.string(),applicationNumber:z.string().optional(),submissionDate:z.coerce.date().optional(),verificationDate:z.coerce.date().optional(),status:z.enum(["NOT_SUBMITTED","SUBMITTED","VERIFIED","REJECTED","EXPIRED"]),remarks:z.string().optional()}).parse(req.body);res.status(201).json({success:true,data:await prisma.jeevanPramaanRecord.create({data:x})});}catch(error){if(error instanceof z.ZodError) throw new HttpError(400,error.issues?.[0]?.message||"Validation failed");throw error;}}
export async function updateJeevan(req:Request,res:Response){try{const id=z.string().parse(req.params.id);const x=z.object({pensionerId:z.string().optional(),applicationNumber:z.string().optional(),submissionDate:z.coerce.date().optional(),verificationDate:z.coerce.date().optional(),status:z.enum(["NOT_SUBMITTED","SUBMITTED","VERIFIED","REJECTED","EXPIRED"]).optional(),remarks:z.string().optional()}).parse(req.body);res.json({success:true,data:await prisma.jeevanPramaanRecord.update({where:{id},data:x})});}catch(error){if(error instanceof z.ZodError) throw new HttpError(400,error.issues?.[0]?.message||"Validation failed");throw error;}}
export async function deleteJeevan(req:Request,res:Response){const id=z.string().parse(req.params.id);await prisma.jeevanPramaanRecord.delete({where:{id}});res.json({success:true,message:"Jeevan Pramaan record deleted"});}
export async function reportSummary(_req:Request,res:Response){const [users,leads,grievances,jeevan,policies]=await Promise.all([prisma.pensioner.groupBy({by:["status"],_count:{_all:true}}),prisma.lead.groupBy({by:["status"],_count:{_all:true}}),prisma.grievance.groupBy({by:["status"],_count:{_all:true}}),prisma.jeevanPramaanRecord.groupBy({by:["status"],_count:{_all:true}}),prisma.policy.count()]);res.json({success:true,data:{users,leads,grievances,jeevan,policies}});}
