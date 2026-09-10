import type { CorsOptions } from "cors";
import { env } from "../../config/config.service.js";
import { BadRequestException } from "../response/error.response.js";

const whiteList: string[] = env.WHITE_LIST;

export function corsOptions(): CorsOptions {
  return {
    origin: (origin, callback) => {
      if (!origin || whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(BadRequestException("Not Allowed By Cors!") as unknown as Error);
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  };
}