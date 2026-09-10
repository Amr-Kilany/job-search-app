// src/Utils/socket/socket.utils.ts
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import ChatModel from "../../DB/Models/Chat.model.js";
import CompanyModel from "../../DB/Models/Company.model.js";

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // User joins their personal room identified by their Mongo User ID
    socket.on("joinChat", (userId: string) => {
      socket.join(userId);
    });

    socket.on("sendMessage", async (data: { senderId: string; receiverId: string; message: string }) => {
      const { senderId, receiverId, message } = data;

      let chat = await ChatModel.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      // Requirement: Only HR or Company Owner can kick off a conversation with a regular user
      if (!chat) {
        const isHR = await CompanyModel.findOne({
          $or: [{ CreatedBy: senderId }, { HRs: senderId }],
        });

        if (!isHR) {
          socket.emit("error", { message: "Only HR or Company Owner can initiate a conversation." });
          return;
        }

        chat = await ChatModel.create({
          senderId,
          receiverId,
          messages: [{ message, senderId }],
        });
      } else {
        chat.messages.push({ message, senderId } as any);
        await chat.save();
      }

      // Emit real-time message to receiver's room
      io.to(receiverId).emit("receiveMessage", { senderId, message });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
