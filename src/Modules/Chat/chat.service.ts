import type { Request, Response } from "express";
import ChatModel from "../../DB/Models/Chat.model.js";
import * as DB from "../../DB/database.repository.js";
import { NotFoundException } from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  const { targetUserId } = req.params;
  const currentUserId = req.user?._id;

  const chat = await DB.findOne({
    model: ChatModel,
    filter: {
      $or: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ],
    },
    options: {
      populate: [
        { path: "senderId", select: "firstName lastName email" },
        { path: "receiverId", select: "firstName lastName email" },
      ],
    },
  });

  if (!chat) {
    throw NotFoundException("No chat history found with this user");
  }

  successResponse({
    res,
    statusCode: 200,
    message: "Chat history retrieved successfully",
    data: { chat },
  });
};
