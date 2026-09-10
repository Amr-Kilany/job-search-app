import crypto from "crypto";
import { env } from "../../config/config.service.js";

const IV_LENGTH = 16;

const getSecretKey = (): Buffer => {
  const key = env.ENC_KEY;
  if (!key) {
    throw new Error("ENC_KEY is missing in environment variables");
  }
  return Buffer.from(key, "utf-8");
};

export const encrypt = (text: string | undefined): string | undefined => {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encryptedData: string = cipher.update(text, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypt = (encryptedText: string | undefined): string | undefined => {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText;

  try {
    const [ivHex, encryptedData] = encryptedText.split(":");
    if (!ivHex || !encryptedData) return encryptedText;

    const ivBuffer = Buffer.from(ivHex, "hex");
    const key = getSecretKey();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer);

    let decryptedData: string = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  }
};
