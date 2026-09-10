import mongoose from "mongoose";

export interface ICompany extends mongoose.Document {
  companyName: string;
  description: string;
  industry: string;
  address: string;
  numberOfEmployees: string; 
  companyEmail: string;
  CreatedBy: mongoose.Types.ObjectId;
  HRs: mongoose.Types.ObjectId[];
  logo?: { secure_url: string; public_id: string };
  coverPic?: { secure_url: string; public_id: string };
  legalAttachment?: { secure_url: string; public_id: string };
  approvedByAdmin: boolean;
  deletedAt?: Date;
  bannedAt?: Date;
}

const companySchema = new mongoose.Schema<ICompany>(
  {
    companyName: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    address: { type: String, required: true },
    numberOfEmployees: { type: String, required: true },
    companyEmail: { type: String, required: true, unique: true, lowercase: true },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    HRs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    logo: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    legalAttachment: { secure_url: String, public_id: String },
    approvedByAdmin: { type: Boolean, default: false },
    deletedAt: { type: Date },
    bannedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
});

const CompanyModel =
  (mongoose.models.Company as mongoose.Model<ICompany>) || mongoose.model<ICompany>("Company", companySchema);
export default CompanyModel;
