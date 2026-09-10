import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../Utils/response/error.response.js";

type ReqTarget = "body" | "params" | "query" | "headers";

export const validationMiddleware = (DtoClass: any, target: ReqTarget = "body") => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dataToValidate = req[target];
    const dtoInstance = plainToInstance(DtoClass, dataToValidate);

    const errors: ValidationError[] = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors.map((err) => ({
        property: err.property,
        constraints: err.constraints,
      }));
      BadRequestException("Validation Error", errorMessages);
    }

    req[target] = dtoInstance;
    next();
  };
};
