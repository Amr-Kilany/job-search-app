import { Router } from "express";
import * as jobService from "./job-opportunity.service.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post("/", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), jobService.addJob);

router.put("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), jobService.updateJob);

router.delete("/:id", authenticate({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }), jobService.deleteJob);

router.get("/", authenticate(), jobService.getFilteredJobs);

export default router;
