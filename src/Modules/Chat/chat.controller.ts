import { Router } from "express";
import * as chatService from "./chat.service.js";
import { authenticate } from "../../Middlewares/auth.middleware.js";

const router = Router();

router.get("/:targetUserId", authenticate(), chatService.getChatHistory);

export default router;
