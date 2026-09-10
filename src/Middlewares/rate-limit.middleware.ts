import type { Request, Response, NextFunction } from "express";
import { TooManyRequestsException } from "../Utils/response/error.response.js";

interface IpRecord {
  count: number;
  startTime: number;
}

const ipRequest: Record<string, IpRecord> = {};
const blockedIps = new Set<string>();
const unBlockersTimers = new Map<string, NodeJS.Timeout>();

const RATE_LIMIT = 15;
const WINDOW_MS = 15 * 60 * 1000;

export const customRateLimiter = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || "unknown";

    const currentTime = Date.now();

    if (blockedIps.has(ip)) {
      TooManyRequestsException("Too many requests, please try again later.");
    }

    const currentRecord = ipRequest[ip];

    if (!currentRecord) {
      ipRequest[ip] = { count: 1, startTime: currentTime };
      return next();
    }

    const diff = currentTime - currentRecord.startTime;

    if (diff < WINDOW_MS) {
      currentRecord.count++;

      if (currentRecord.count > RATE_LIMIT) {
        blockedIps.add(ip);

        if (!unBlockersTimers.has(ip)) {
          const timer = setTimeout(() => {
            blockedIps.delete(ip);
            unBlockersTimers.delete(ip);
          }, WINDOW_MS);
          unBlockersTimers.set(ip, timer);
        }

        TooManyRequestsException("Too many requests, please try again later.");
      }
    } else {
      ipRequest[ip] = { count: 1, startTime: currentTime };
    }

    next();
  };
};
