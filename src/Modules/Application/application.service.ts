import type { Request, Response } from "express";
import ApplicationModel from "../../DB/Models/Application.model.js";
import JobModel from "../../DB/Models/Job.model.js";
import CompanyModel from "../../DB/Models/Company.model.js";
import * as DB from "../../DB/database.repository.js";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import { applicationEventEmitter } from "../../Utils/events/email.event.js";
import { ApplicationStatusEnum } from "../../Utils/enums/application.enum.js";
import ExcelJS from "exceljs";

export const applyToJob = async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  const userId = req.user?._id;

  const job = await DB.findOne({
    model: JobModel,
    filter: { _id: jobId, closed: { $ne: true } },
  });

  if (!job) {
    throw NotFoundException("Job opportunity not found or is closed");
  }

  const existingApplication = await DB.findOne({
    model: ApplicationModel,
    filter: { jobId, userId },
  });

  if (existingApplication) {
    throw BadRequestException("You have already applied for this job");
  }

  const file = req.file;
  const userCV = file ? { secure_url: file.path, public_id: file.filename } : req.body.userCV;

  if (!userCV) {
    throw BadRequestException("CV file is required");
  }

  const application = await DB.create({
    model: ApplicationModel,
    data: {
      jobId,
      userId,
      userCV,
    },
  });

  successResponse({
    res,
    statusCode: 201,
    message: "Application submitted successfully",
    data: { application },
  });
};

export const getCompanyApplications = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const { limit = 10, skip = 0 } = req.query;
  const userId = req.user?._id;

  const company = await DB.findOne({
    model: CompanyModel,
    filter: { _id: companyId },
  });

  if (!company) {
    throw NotFoundException("Company not found");
  }

  const isOwner = company.CreatedBy.toString() === userId.toString();
  const isHR = company.HRs?.some((hrId: any) => hrId.toString() === userId.toString());

  if (!isOwner && !isHR) {
    throw ForbiddenException("Only company owner or HRs can view applications");
  }

  const companyJobs = await DB.find({
    model: JobModel,
    filter: { companyId },
  });

  const jobIds = companyJobs.map((job) => job._id);

  const applications = await DB.find({
    model: ApplicationModel,
    filter: { jobId: { $in: jobIds } },
    options: {
      limit: Number(limit),
      skip: Number(skip),
      populate: [
        { path: "userId", select: "firstName lastName email mobileNumber" },
        { path: "jobId", select: "jobTitle seniorityLevel" },
      ],
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Applications retrieved successfully",
    data: { applications },
  });
};


export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { applicationId } = req.params;
  const { status } = req.body; 
  const userId = req.user?._id;

  if (![ApplicationStatusEnum.ACCEPTED, ApplicationStatusEnum.REJECTED].includes(status)) {
    throw BadRequestException("Invalid status. Allowed values: accepted, rejected");
  }

  const application = await DB.findOne({
    model: ApplicationModel,
    filter: { _id: applicationId },
    options: {
      populate: [
        { path: "userId", select: "email firstName lastName" },
        { path: "jobId", select: "jobTitle companyId" },
      ],
    },
  });

  if (!application) {
    throw NotFoundException("Application not found");
  }

  
  const company = await DB.findOne({
    model: CompanyModel,
    filter: { _id: (application.jobId as any).companyId },
  });

  const isOwner = company?.CreatedBy.toString() === userId.toString();
  const isHR = company?.HRs?.some((hrId: any) => hrId.toString() === userId.toString());

  if (!isOwner && !isHR) {
    throw ForbiddenException("Only company HRs or owners can update application status");
  }

  application.status = status;
  await application.save();

  
  applicationEventEmitter.emit("applicationDecision", {
    applicantEmail: (application.userId as any).email,
    applicantName: (application.userId as any).firstName,
    jobTitle: (application.jobId as any).jobTitle,
    status,
  });

  successResponse({
    res,
    statusCode: 200,
    message: `Application marked as ${status} successfully`,
    data: { application },
  });
};

export const exportApplicationsToExcel = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const { date } = req.query; 
  const userId = req.user?._id;

  const company = await DB.findOne({
    model: CompanyModel,
    filter: { _id: companyId },
  });

  if (!company) {
    throw NotFoundException("Company not found");
  }

  const isOwner = company.CreatedBy.toString() === userId.toString();
  const isHR = company.HRs?.some((hrId: any) => hrId.toString() === userId.toString());

  if (!isOwner && !isHR) {
    throw ForbiddenException("Access denied. Only company HR or owner can export data.");
  }

  const targetDate = date ? new Date(date as string) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const companyJobs = await DB.find({ model: JobModel, filter: { companyId } });
  const jobIds = companyJobs.map((j) => j._id);

  const applications = await DB.find({
    model: ApplicationModel,
    filter: {
      jobId: { $in: jobIds },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    },
    options: {
      populate: [
        { path: "userId", select: "firstName lastName email mobileNumber" },
        { path: "jobId", select: "jobTitle" },
      ],
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Applications");

  worksheet.columns = [
    { header: "Applicant Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Mobile Number", key: "mobile", width: 20 },
    { header: "Job Title", key: "jobTitle", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Applied Date", key: "createdAt", width: 25 },
  ];

  applications.forEach((app: any) => {
    worksheet.addRow({
      name: `${app.userId?.firstName || ""} ${app.userId?.lastName || ""}`.trim(),
      email: app.userId?.email || "",
      mobile: app.userId?.mobileNumber || "",
      jobTitle: app.jobId?.jobTitle || "",
      status: app.status,
      createdAt: app.createdAt ? app.createdAt.toISOString() : "",
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=applications-${companyId}-${date || "today"}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};
