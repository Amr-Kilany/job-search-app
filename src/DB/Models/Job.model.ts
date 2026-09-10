import mongoose from "mongoose";
import { JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from "../../Utils/enums/job.enum.js";

export interface IJob extends mongoose.Document {
  jobTitle: string;
  jobLocation: JobLocationEnum;
  workingTime: WorkingTimeEnum;
  seniorityLevel: SeniorityLevelEnum;
  jobDescription: string;
  technicalSkills: string[];
  softSkills: string[];
  addedBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  closed: boolean;
  companyId: mongoose.Types.ObjectId;
}

const jobSchema = new mongoose.Schema<IJob>(
  {
    jobTitle: { type: String, required: true, trim: true },
    jobLocation: {
      type: String,
      enum: Object.values(JobLocationEnum),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(WorkingTimeEnum),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(SeniorityLevelEnum),
      required: true,
    },
    jobDescription: { type: String, required: true },
    technicalSkills: [{ type: String, required: true }],
    softSkills: [{ type: String, required: true }],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closed: { type: Boolean, default: false },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  },
  {
    timestamps: true,
  },
);

const JobModel = (mongoose.models.Job as mongoose.Model<IJob>) || mongoose.model<IJob>("Job", jobSchema);
export default JobModel;
