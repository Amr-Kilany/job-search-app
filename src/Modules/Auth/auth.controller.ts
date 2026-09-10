import { Router } from "express";
import * as authService from "./auth.service.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { ConfirmEmailDto, ForgetPasswordDto, LoginDto, ResetPasswordDto, SignUpDto } from "./auth.validation.js";

const router = Router();

router.post("/signup", validationMiddleware(SignUpDto, "body"), authService.signUp);
router.post("/confirm-email", validationMiddleware(ConfirmEmailDto, "body"), authService.confirmEmail);
router.post("/login", validationMiddleware(LoginDto, "body"), authService.login);
router.post("/signup-google", validationMiddleware(SignUpDto, "body"), authService.signupWithGoogle);
router.post("/login-google", authService.loginWithGoogle);
router.post("/forget-password", validationMiddleware(ForgetPasswordDto, "body"), authService.forgetPassword);
router.post("/reset-password", validationMiddleware(ResetPasswordDto, "body"), authService.resetPassword);

router.post("/refresh-token", authenticate({ tokenType: TokenTypeEnum.REFRESH }), authService.refreshToken);

export default router;
