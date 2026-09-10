import { compare, hash } from "bcrypt";
import { env } from "../../config/config.service.js";
import { BadRequestException } from "../response/error.response.js";

interface GenerateHashOptions {
  plainText: string;
  saltRounds?: number;
}

interface CompareHashOptions {
  plainText: string;
  cipherText: string;
}

export const generateHash = async ({
  plainText,
  saltRounds = Number(env.SALT_ROUNDS) || 12,
}: GenerateHashOptions): Promise<string> => {
  if (!plainText) {
    throw BadRequestException("Plain text is required for hashing");
  }

  return await hash(plainText, saltRounds);
};

export const compareHash = async ({ plainText, cipherText }: CompareHashOptions): Promise<boolean> => {
  if (!plainText || !cipherText) return false;

  return await compare(plainText, cipherText);
};
