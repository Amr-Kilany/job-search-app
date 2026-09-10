import mongoose from "mongoose";
import { ApplicationStatusEnum } from "../../Utils/enums/application.enum.js";

export interface IApplication extends mongoose.Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userCV: { secure_url: string; public_id: string };
  status: ApplicationStatusEnum;
}

const applicationSchema = new mongoose.Schema<IApplication>(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userCV: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatusEnum),
      default: ApplicationStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

const ApplicationModel =
  (mongoose.models.Application as mongoose.Model<IApplication>) ||
  mongoose.model<IApplication>("Application", applicationSchema);
export default ApplicationModel;
