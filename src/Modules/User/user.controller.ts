import { Router } from "express";
import * as userService from "./user.service.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { UpdatePasswordDto, UpdateProfileDto } from "./user.validation.js";

const router = Router();

router.get("/profile", authenticate(), userService.getProfile);

router.patch("/profile", authenticate(), validationMiddleware(UpdateProfileDto, "body"), userService.updateProfile);

router.patch(
  "/update-password",
  authenticate(),
  validationMiddleware(UpdatePasswordDto, "body"),
  userService.updatePassword,
);

router.delete("/account", authenticate(), userService.deleteAccount);

router.get("/:id/profile", authenticate(), userService.getPublicProfile);

export default router;
