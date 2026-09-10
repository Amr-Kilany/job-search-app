import { Router } from "express";
import * as companyService from "./company.service.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post("/", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.addCompany);

router.put("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.updateCompany);

router.delete("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.softDeleteCompany);

router.get("/search", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.searchCompanyByName);

router.get("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), companyService.getCompanyWithJobs);

export default router;
