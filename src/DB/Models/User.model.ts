import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../Utils/enums/user.enum.js";
import { encrypt, decrypt } from "../../Utils/security/encryption.security.js";
import { generateHash } from "../../Utils/security/hash.security.js";

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  provider: ProviderEnum;
  gender: GenderEnum;
  DOB: Date;
  mobileNumber: string;
  role: RoleEnum;
  isConfirmed: boolean;
  deletedAt?: Date;
  bannedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
  changeCredentialTime?: Date;
  profilePic?: { secure_url: string; public_id: string };
  coverPic?: { secure_url: string; public_id: string };
  OTP?: Array<{ code: string; type: string; expiresIn: Date }>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    DOB: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          const ageDifMs = Date.now() - value.getTime();
          const ageDate = new Date(ageDifMs);
          return Math.abs(ageDate.getUTCFullYear() - 1970) >= 18;
        },
        message: "User must be at least 18 years old.",
      },
    },
    mobileNumber: {
      type: String,
      required: true,
      set: (value: string) => (value ? (encrypt(value) as string) : value),
      get: (value: string) => (value ? (decrypt(value) as string) : value),
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    isConfirmed: { type: Boolean, default: false },
    deletedAt: { type: Date },
    bannedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changeCredentialTime: { type: Date },
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    OTP: [
      {
        code: String,
        type: { type: String, enum: ["confirmEmail", "forgetPassword"] },
        expiresIn: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await generateHash({ plainText: this.password });
});

const UserModel = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default UserModel;
