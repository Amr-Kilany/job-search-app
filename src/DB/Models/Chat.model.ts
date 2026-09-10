import mongoose from "mongoose";

export interface IMessage {
  message: string;
  senderId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IChat extends mongoose.Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    message: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const chatSchema = new mongoose.Schema<IChat>(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema],
  },
  { timestamps: true },
);

const ChatModel = (mongoose.models.Chat as mongoose.Model<IChat>) || mongoose.model<IChat>("Chat", chatSchema);
export default ChatModel;
