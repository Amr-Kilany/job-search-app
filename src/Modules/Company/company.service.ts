import type { Request, Response } from "express";
import CompanyModel, { type ICompany } from "../../DB/Models/Company.model.js";
import JobModel from "../../DB/Models/Job.model.js";
import * as DB from "../../DB/database.repository.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import mongoose from "mongoose";

export const addCompany = async (req: Request, res: Response): Promise<void> => {
  const { companyName, description, industry, address, numberOfEmployees, companyEmail, HRs } = req.body;
  const userId = req.user?._id;

  const existingName = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { companyName, deletedAt: { $exists: false } },
  });

  if (existingName) {
    throw ConflictException("Company name is already registered");
  }

  const existingEmail = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { companyEmail, deletedAt: { $exists: false } },
  });

  if (existingEmail) {
    throw ConflictException("Company email is already in use");
  }

  const company = await DB.create<ICompany>({
    model: CompanyModel,
    data: {
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      CreatedBy: userId,
      HRs: HRs ?? [],
    },
  });

  successResponse({
    res,
    statusCode: 201,
    message: "Company created successfully",
    data: { company },
  });
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = req.user;

  const company = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { _id: id, deletedAt: { $exists: false } },
  });

  if (!company) {
    throw NotFoundException("Company not found");
  }

  const isOwner = company.CreatedBy.toString() === user._id.toString();
  const isAdmin = user.role === RoleEnum.ADMIN;

  if (!isOwner && !isAdmin) {
    throw ForbiddenException("Only the company owner or an admin can update company data");
  }

  const { companyName, companyEmail } = req.body;

  if (companyName && companyName !== company.companyName) {
    const nameConflict = await DB.findOne<ICompany>({
      model: CompanyModel,
      filter: { companyName, _id: { $ne: id }, deletedAt: { $exists: false } },
    });
    if (nameConflict) {
      throw ConflictException("Company name is already taken");
    }
  }

  if (companyEmail && companyEmail !== company.companyEmail) {
    const emailConflict = await DB.findOne<ICompany>({
      model: CompanyModel,
      filter: { companyEmail, _id: { $ne: id }, deletedAt: { $exists: false } },
    });
    if (emailConflict) {
      throw ConflictException("Company email is already taken");
    }
  }

  const updatedCompany = await DB.findByIdAndUpdate<ICompany>({
    model: CompanyModel,
    id: id as string,
    update: { $set: req.body },
    options: { new: true },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Company details updated successfully",
    data: { company: updatedCompany },
  });
};

export const softDeleteCompany = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = req.user;

  const company = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { _id: id, deletedAt: { $exists: false } },
  });

  if (!company) {
    throw NotFoundException("Company not found");
  }

  const isOwner = company.CreatedBy.toString() === user._id.toString();
  const isAdmin = user.role === RoleEnum.ADMIN;

  if (!isOwner && !isAdmin) {
    throw ForbiddenException("Only the company owner or an admin can delete this company");
  }

  await DB.updateOne({
    model: CompanyModel,
    filter: { _id: id },
    update: { $set: { deletedAt: new Date() } },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Company soft deleted successfully",
  });
};

export const getCompanyWithJobs = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const company = await DB.findOne<ICompany>({
    model: CompanyModel,
    filter: { _id: id, deletedAt: { $exists: false } },
  });

  if (!company) {
    throw NotFoundException("Company not found");
  }

  const jobs = await DB.find({
    model: JobModel,
    filter: { companyId: id, closed: { $ne: true } },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Company details retrieved successfully",
    data: { company, jobs },
  });
};

export const searchCompanyByName = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.query;

  if (!name || typeof name !== "string") {
    throw BadRequestException("Search query 'name' is required");
  }

  const companies = await DB.find<ICompany>({
    model: CompanyModel,
    filter: {
      companyName: { $regex: name, $options: "i" },
      deletedAt: { $exists: false },
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Companies fetched successfully",
    data: { companies },
  });
};

export const uploadCompanyLogo = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.file) {
    return BadRequestException("Please upload an image file");
  }

  const company = await CompanyModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id as string), CreatedBy: req.user!._id },
    { logo: { secure_url: req.file.path, public_id: req.file.filename } },
    { new: true },
  );

  if (!company) {
    return NotFoundException("Company not found or unauthorized");
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Company logo uploaded successfully",
    data: { company },
  });
};

export const uploadCompanyCoverPic = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.file) {
    return BadRequestException("Please upload an image file");
  }

  const company = await CompanyModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id as string), CreatedBy: req.user!._id },
    { coverPic: { secure_url: req.file.path, public_id: req.file.filename } },
    { new: true },
  );

  if (!company) {
    return NotFoundException("Company not found or unauthorized");
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Company cover picture uploaded successfully",
    data: { company },
  });
};

export const deleteCompanyLogo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const company = await CompanyModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id as string), CreatedBy: req.user!._id },
    { $unset: { logo: "" } },
    { new: true },
  );

  if (!company) {
    return NotFoundException("Company not found or unauthorized");
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Company logo deleted successfully",
    data: { company },
  });
};

export const deleteCompanyCoverPic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const company = await CompanyModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id as string), CreatedBy: req.user!._id },
    { $unset: { coverPic: "" } },
    { new: true },
  );

  if (!company) {
    return NotFoundException("Company not found or unauthorized");
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Company cover picture deleted successfully",
    data: { company },
  });
};
