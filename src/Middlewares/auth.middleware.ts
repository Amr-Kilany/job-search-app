import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import UserModel from "../DB/Models/User.model.js";
import * as DB from "../DB/database.repository.js";
import { RoleEnum, TokenTypeEnum } from "../Utils/enums/user.enum.js";
import { UnauthorizedException, ForbiddenException } from "../Utils/response/error.response.js";
import { verifyToken, getJwtConfig } from "../Utils/security/token.security.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export interface AuthOptions {
  roles?: RoleEnum[];
  tokenType?: TokenTypeEnum;
}

export const authenticate = (options: AuthOptions = {}) => {
  const { roles = [], tokenType = TokenTypeEnum.ACCESS } = options;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.body?.refreshToken;

      if (!token) {
        throw UnauthorizedException("Authentication token is missing");
      }

      const unverified = jwt.decode(token) as JwtPayload | null;
      if (!unverified || typeof unverified === "string") {
        throw UnauthorizedException("Invalid token format");
      }

      const claimsType = unverified.type || unverified.tokenType;
      if (claimsType !== tokenType) {
        throw UnauthorizedException(`Invalid token type. Expected ${tokenType} token.`);
      }

      const { secret } = getJwtConfig(unverified.role, tokenType);

      let decoded: JwtPayload | string;
      try {
        decoded = verifyToken({ token, signature: secret });
      } catch {
        throw UnauthorizedException("Invalid or expired token");
      }

      if (typeof decoded === "string") {
        throw UnauthorizedException("Invalid token payload");
      }

      const user = await DB.findOne({
        model: UserModel,
        filter: { _id: decoded.id, deletedAt: { $exists: false } },
      });

      if (!user) {
        throw UnauthorizedException("User account no longer exists");
      }

      if (!user.isConfirmed) {
        throw ForbiddenException("Please confirm your email address first");
      }

      if (roles.length > 0 && !roles.includes(user.role as RoleEnum)) {
        throw ForbiddenException("You do not have permission to access this resource");
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
