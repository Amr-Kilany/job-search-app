import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsDateString,
  Length,
} from "class-validator";
import { GenderEnum, RoleEnum } from "../../Utils/enums/user.enum.js";

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @Matches(/^01[0125][0-9]{8}$/, { message: "Invalid Egyptian phone number" })
  mobileNumber!: string;

  @IsDateString()
  @IsNotEmpty()
  DOB!: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;
}

export class ConfirmEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "OTP code must be exactly 6 digits" })
  code!: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class ForgetPasswordDto {
  @IsEmail({}, { message: "Invalid email address format" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: "Invalid email address format" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsString({ message: "Code must be a string" })
  @IsNotEmpty({ message: "OTP code is required" })
  code!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsNotEmpty({ message: "New password is required" })
  newPassword!: string;
}
