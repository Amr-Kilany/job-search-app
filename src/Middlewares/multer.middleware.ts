import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { BadRequestException } from "../Utils/response/error.response.js";

export const allowedFileTypes = {
  image: ["image/png", "image/jpeg", "image/webp"],
  document: ["application/pdf"],
};

export const uploadFile = (allowedTypes: string[]) => {
  const storage = multer.diskStorage({});

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(BadRequestException(`Invalid file format. Allowed: ${allowedTypes.join(", ")}`) as unknown as Error);
    }
  };

  return multer({ storage, fileFilter });
};
