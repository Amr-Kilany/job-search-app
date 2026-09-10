import type { Request, Response } from "express";
import UserModel from "../../DB/Models/User.model.js";
import * as DB from "../../DB/database.repository.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import { compareHash, generateHash } from "../../Utils/security/hash.security.js";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  successResponse({
    res,
    statusCode: 200,
    message: "User profile retrieved successfully",
    data: { user },
  });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user._id;
  const { firstName, lastName, mobileNumber, DOB, gender } = req.body;

  if (mobileNumber) {
    const existingMobile = await DB.findOne({
      model: UserModel,
      filter: {
        mobileNumber,
        _id: { $ne: userId },
      },
    });

    if (existingMobile) {
      throw ConflictException("Mobile number is already in use by another account");
    }
  }

  const updatedUser = await DB.findByIdAndUpdate({
    model: UserModel,
    id: userId,
    update: { $set: { firstName, lastName, mobileNumber, DOB, gender } },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Profile updated successfully",
    data: { user: updatedUser },
  });
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  const isPasswordValid = await compareHash({
    plainText: oldPassword,
    cipherText: user.password,
  });

  if (!isPasswordValid) {
    throw UnauthorizedException("Incorrect old password");
  }

  if (oldPassword === newPassword) {
    throw BadRequestException("New password cannot be identical to old password");
  }

  const hashedPassword = await generateHash({ plainText: newPassword });

  await DB.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    update: { $set: { password: hashedPassword } },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Password updated successfully",
  });
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user._id;

  await DB.updateOne({
    model: UserModel,
    filter: { _id: userId },
    update: { $set: { deletedAt: new Date() } },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Account soft deleted successfully",
  });
};

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await DB.findOne({
    model: UserModel,
    filter: {
      _id: id,
      deletedAt: { $exists: false },
    },
    select: "firstName lastName username profilePic coverPic role",
  });

  if (!user) {
    throw NotFoundException("User profile not found");
  }

  successResponse({
    res,
    statusCode: 200,
    message: "Public profile retrieved successfully",
    data: { user },
  });
};

export const uploadProfilePic = async (req: Request, res: Response) => {
  if (!req.file) {
    return BadRequestException("Please upload an image file");
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user!._id,
    { profilePic: { secure_url: req.file.path, public_id: req.file.filename } },
    { new: true },
  );

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile picture uploaded successfully",
    data: { user: user! },
  });
};

export const uploadCoverPic = async (req: Request, res: Response) => {
  if (!req.file) {
    return BadRequestException("Please upload an image file");
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user!._id,
    { coverPic: { secure_url: req.file.path, public_id: req.file.filename } },
    { new: true },
  );

  return successResponse({
    res,
    statusCode: 200,
    message: "Cover picture uploaded successfully",
    data: { user: user! },
  });
};

export const deleteProfilePic = async (req: Request, res: Response) => {
  const user = await UserModel.findByIdAndUpdate(req.user!._id, { $unset: { profilePic: "" } }, { new: true });

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile picture deleted successfully",
    data: { user: user! },
  });
};

export const deleteCoverPic = async (req: Request, res: Response) => {
  const user = await UserModel.findByIdAndUpdate(req.user!._id, { $unset: { coverPic: "" } }, { new: true });

  return successResponse({
    res,
    statusCode: 200,
    message: "Cover picture deleted successfully",
    data: { user: user! },
  });
};
