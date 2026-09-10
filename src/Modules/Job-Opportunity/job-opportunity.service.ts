import type { Request, Response } from "express";
import JobModel, { type IJob } from "../../DB/Models/Job.model.js";
import CompanyModel, { type ICompany } from "../../DB/Models/Company.model.js";
import ApplicationModel from "../../DB/Models/Application.model.js";
import * as DB from "../../DB/database.repository.js";
import { ForbiddenException, NotFoundException } from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import mongoose from "mongoose";

export const addJob = async (req: Request, res: Response): Promise<void> => {
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, companyId } =
    req.body;
  const userId = req.user?._id;

  const company = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { _id: companyId, deletedAt: { $exists: false } },
  });

  if (!company) {
    throw NotFoundException("Target company does not exist");
  }

  const isOwner = company.CreatedBy.toString() === userId.toString();
  const isHR = company.HRs?.some((hrId: any) => hrId.toString() === userId.toString());

  if (!isOwner && !isHR) {
    throw ForbiddenException("Only company owner or designated HRs can add jobs");
  }

  const job = await DB.create<IJob>({
    model: JobModel,
    data: {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      companyId,
      addedBy: userId,
    },
  });

  successResponse({
    res,
    statusCode: 201,
    message: "Job opportunity created successfully",
    data: { job },
  });
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const job = await DB.findOne<IJob>({
    model: JobModel,
    filter: { _id: id },
  });

  if (!job) {
    throw NotFoundException("Job opportunity not found");
  }

  if (job.addedBy.toString() !== userId.toString()) {
    throw ForbiddenException("Only the publisher of this job can update it");
  }

  const updatedJob = await DB.findByIdAndUpdate<IJob>({
    model: JobModel,
    id: id as string,
    update: { $set: req.body },
    options: { new: true },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Job opportunity updated successfully",
    data: { job: updatedJob },
  });
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const job = await DB.findOne<IJob>({
    model: JobModel,
    filter: { _id: id },
  });

  if (!job) {
    throw NotFoundException("Job opportunity not found");
  }

  const company = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { _id: job.companyId },
  });

  const isHR = company?.HRs?.some((hrId: any) => hrId.toString() === userId.toString());
  const isOwner = company?.CreatedBy.toString() === userId.toString();

  if (!isHR && !isOwner) {
    throw ForbiddenException("Only HRs or company owner can delete this job");
  }

  await DB.deleteOne({
    model: JobModel,
    filter: { _id: id },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Job deleted successfully",
  });
};

export const getFilteredJobs = async (req: Request, res: Response): Promise<void> => {
  const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills, limit = 10, skip = 0 } = req.query;

  const filter: Record<string, any> = {};

  if (workingTime) filter.workingTime = workingTime;
  if (jobLocation) filter.jobLocation = jobLocation;
  if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
  if (jobTitle) filter.jobTitle = { $regex: jobTitle as string, $options: "i" };
  if (technicalSkills) {
    const skillsArr = (technicalSkills as string).split(",");
    filter.technicalSkills = { $in: skillsArr };
  }

  const jobs = await DB.find<IJob>({
    model: JobModel,
    filter,
    options: {
      limit: Number(limit),
      skip: Number(skip),
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Jobs retrieved successfully",
    data: { jobs },
  });
};

export const getCompanyJobs = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId: new mongoose.Types.ObjectId(companyId as string) };

  const [jobs, totalCount] = await Promise.all([
    JobModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    JobModel.countDocuments(filter),
  ]);

  return successResponse({
    res,
    statusCode: 200,
    message: "Company jobs fetched successfully",
    data: {
      jobs,
      pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
    },
  });
};

export const getJobApplications = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { jobId: new mongoose.Types.ObjectId(jobId as string) };

  const [applications, totalCount] = await Promise.all([
    ApplicationModel.find(filter)
      .populate({ path: "userId", select: "firstName lastName email mobileNumber profilePic" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ApplicationModel.countDocuments(filter),
  ]);

  return successResponse({
    res,
    statusCode: 200,
    message: "Job applications fetched successfully",
    data: {
      applications,
      pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
    },
  });
};
