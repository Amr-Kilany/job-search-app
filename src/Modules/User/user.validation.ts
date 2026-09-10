import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { GenderEnum } from "../../Utils/enums/user.enum.js";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  DOB?: string;

  @IsOptional()
  @IsEnum(GenderEnum, { message: "Gender must be either MALE or FEMALE" })
  gender?: GenderEnum;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8, { message: "Old password must be at least 8 characters" })
  oldPassword!: string;

  @IsString()
  @MinLength(8, { message: "New password must be at least 8 characters" })
  newPassword!: string;
}
