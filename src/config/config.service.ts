import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = {
  development: ".env.dev",
  staging: ".env.staging",
  production: ".env.prod",
} as const;

export type NodeEnv = keyof typeof envPath;

export const NODE_ENV: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";

dotenv.config({ path: resolve(__dirname, `../../config/${envPath[NODE_ENV]}`) });

export const env = {
  // Application settings
  NODE_ENV,
  PORT: Number(process.env.PORT) || 5000,
  APP_NAME: (process.env.APP_NAME as string) || "Job Search App",

  // Database settings
  DB_URI: process.env.DB_URI as string,

  // Security settings
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 10,

  // JWT settings
  ENC_KEY: process.env.ENC_KEY as string,
  ACCESS_TOKEN_ADMIN_SECRET: process.env.ACCESS_TOKEN_ADMIN_SECRET as string,
  REFRESH_TOKEN_ADMIN_SECRET: process.env.REFRESH_TOKEN_ADMIN_SECRET as string,
  ACCESS_TOKEN_ADMIN_EXPIRATION: Number(process.env.ACCESS_TOKEN_ADMIN_EXPIRATION) || 86400,
  REFRESH_TOKEN_ADMIN_EXPIRATION: Number(process.env.REFRESH_TOKEN_ADMIN_EXPIRATION) || 172800,
  ACCESS_TOKEN_USER_SECRET: process.env.ACCESS_TOKEN_USER_SECRET as string,
  REFRESH_TOKEN_USER_SECRET: process.env.REFRESH_TOKEN_USER_SECRET as string,
  ACCESS_TOKEN_USER_EXPIRATION: process.env.ACCESS_TOKEN_USER_EXPIRATION as string,
  REFRESH_TOKEN_USER_EXPIRATION: process.env.REFRESH_TOKEN_USER_EXPIRATION as string,
  WHITE_LIST: process.env.WHITE_LIST ? process.env.WHITE_LIST.split(",") : [],

  // Email settings
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
};

export type Env = typeof env;
