import { Router } from "express";
import * as companyService from "./company.service.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";
import { uploadFile, allowedFileTypes } from "../../Middlewares/multer.middleware.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post("/", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.addCompany);

router.put("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.updateCompany);

router.delete("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.softDeleteCompany);

router.get("/search", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.searchCompanyByName);

router.patch(
  "/:id/logo",
  authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  uploadFile(allowedFileTypes.image).single("logo"),
  companyService.uploadCompanyLogo,
);

router.patch(
  "/:id/cover-pic",
  authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  uploadFile(allowedFileTypes.image).single("coverPic"),
  companyService.uploadCompanyCoverPic,
);

router.delete("/:id/logo", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.deleteCompanyLogo);

router.delete(
  "/:id/cover-pic",
  authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  companyService.deleteCompanyCoverPic,
);

router.get("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.getCompanyWithJobs);

export default router;
