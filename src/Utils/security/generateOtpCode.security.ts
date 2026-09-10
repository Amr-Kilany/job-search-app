import { customAlphabet } from "nanoid";

export const generateOtpCode = customAlphabet("0123456789", 6);
