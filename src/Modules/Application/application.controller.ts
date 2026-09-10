import { Router } from "express";
import * as applicationService from "./application.service.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";
import { uploadFile, allowedFileTypes } from "../../Middlewares/multer.middleware.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post(
  "/:jobId",
  authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  uploadFile(allowedFileTypes.document).single("userCV"),
  applicationService.applyToJob,
);

router.get(
  "/company/:companyId",
  authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  applicationService.getCompanyApplications,
);

router.patch("/:applicationId/status", authenticate(), applicationService.updateApplicationStatus);

router.get("/company/:companyId/excel", authenticate(), applicationService.exportApplicationsToExcel);

export default router;
