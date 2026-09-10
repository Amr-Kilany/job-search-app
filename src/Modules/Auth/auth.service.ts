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
import { encrypt } from "../../Utils/security/encryption.security.js";
import { generateToken } from "../../Utils/security/token.security.js";
import { generateOtpCode } from "../../Utils/security/generateOtpCode.security.js";
import { emailEvent } from "../../Utils/events/email.event.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, mobileNumber, DOB, gender, role } = req.body;

  const existingEmail = await DB.findOne({
    model: UserModel,
    filter: { email },
  });

  if (existingEmail) {
    throw ConflictException("Email address is already in use");
  }

  const encryptedMobile = encrypt(mobileNumber) as string;
  const existingMobile = await DB.findOne({
    model: UserModel,
    filter: { mobileNumber: encryptedMobile },
  });

  if (existingMobile) {
    throw ConflictException("Mobile number is already in use");
  }

  const rawOtp = generateOtpCode();
  const hashedOtp = await generateHash({ plainText: rawOtp });
  const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);


  const user = await DB.create({
    model: UserModel,
    data: {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      DOB,
      gender,
      role,
      OTP: [
        {
          code: hashedOtp,
          type: "confirmEmail",
          expiresIn: otpExpiresIn,
        },
      ],
    },
  });

  emailEvent.emit("sendConfirmEmail", {
    email: user.email,
    otp: rawOtp,
    firstName: user.firstName,
  });

  const userResponse = user.toObject();
  delete (userResponse as any).password;
  delete (userResponse as any).OTP;

  successResponse({
    res,
    statusCode: 201,
    message: "User registered successfully. Please check your email for activation OTP.",
    data: { user: userResponse },
  });
};

export const confirmEmail = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body;

  const user = await DB.findOne({
    model: UserModel,
    filter: { email },
  });

  if (!user) {
    throw NotFoundException("User not found");
  }

  if (user.isConfirmed) {
    throw BadRequestException("Email is already confirmed");
  }

  const otpEntry = user.OTP?.find((o) => o.type === "confirmEmail");
  if (!otpEntry || !otpEntry.code) {
    throw BadRequestException("No active email confirmation OTP found");
  }

  if (new Date() > new Date(otpEntry.expiresIn)) {
    throw BadRequestException("OTP code has expired. Please request a new one.");
  }

  const isMatch = await compareHash({
    plainText: code,
    cipherText: otpEntry.code,
  });

  if (!isMatch) {
    throw BadRequestException("Invalid OTP verification code");
  }

  await DB.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    update: {
      $set: { isConfirmed: true },
      $pull: { OTP: { type: "confirmEmail" } },
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Email confirmed successfully. You can now log in.",
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await DB.findOne({
    model: UserModel,
    filter: { email, deletedAt: { $exists: false } },
  });

  if (!user || !user.password) {
    throw NotFoundException("Invalid email or password");
  }

  if (!user.isConfirmed) {
    throw BadRequestException("Please confirm your email address before logging in");
  }

  const isPasswordValid = await compareHash({
    plainText: password,
    cipherText: user.password,
  });

  if (!isPasswordValid) {
    throw UnauthorizedException("Invalid email or password");
  }

  const accessToken = generateToken({
    payload: { id: user._id, role: user.role, type: TokenTypeEnum.ACCESS },
  });

  const refreshToken = generateToken({
    payload: { id: user._id, role: user.role, type: TokenTypeEnum.REFRESH },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Logged in successfully",
    data: {
      tokens: { accessToken, refreshToken },
    },
  });
};

export const forgetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email, deletedAt: { $exists: false } });

  if (!user) {
    throw NotFoundException("User not found with this email address");
  }

  const rawOtp = generateOtpCode();
  const hashedOtp = await generateHash({ plainText: rawOtp });
  const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

  user.OTP = user.OTP?.filter((o) => o.type !== "forgetPassword") || [];
  user.OTP.push({
    code: hashedOtp,
    type: "forgetPassword",
    expiresIn: otpExpiresIn,
  });

  await user.save();

  emailEvent.emit("sendForgetPasswordEmail", {
    email: user.email,
    otp: rawOtp,
    firstName: user.firstName,
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Password reset OTP sent to your email address",
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, code, newPassword } = req.body;

  const user = await UserModel.findOne({ email, deletedAt: { $exists: false } });

  if (!user) {
    throw NotFoundException("User not found");
  }

  const otpEntry = user.OTP?.find((o) => o.type === "forgetPassword");
  if (!otpEntry || !otpEntry.code) {
    throw BadRequestException("No active password reset request found");
  }

  if (new Date() > new Date(otpEntry.expiresIn)) {
    throw BadRequestException("OTP code has expired. Please request a new one.");
  }

  const isMatch = await compareHash({
    plainText: code,
    cipherText: otpEntry.code,
  });

  if (!isMatch) {
    throw BadRequestException("Invalid OTP verification code");
  }

  
  user.password = newPassword;
  user.OTP = user.OTP?.filter((o) => o.type !== "forgetPassword") || [];
  await user.save();

  successResponse({
    res,
    statusCode: 200,
    message: "Password reset successfully. You can now log in with your new password.",
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  const accessToken = generateToken({
    payload: { id: user._id, role: user.role, type: TokenTypeEnum.ACCESS },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Access token refreshed successfully",
    data: { accessToken },
  });
};
