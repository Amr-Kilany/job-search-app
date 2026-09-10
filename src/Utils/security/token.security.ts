import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/config.service.js";
import { RoleEnum, TokenTypeEnum } from "../enums/user.enum.js";

export interface IGenerateToken {
  payload: {
    id: any;
    role?: RoleEnum | string;
    type?: TokenTypeEnum;
    [key: string]: any;
  };
  signature?: string;
  options?: SignOptions;
}

export interface IVerifyToken {
  token: string;
  signature?: string;
}

export const getJwtConfig = (role: RoleEnum | string = RoleEnum.USER, type: TokenTypeEnum = TokenTypeEnum.ACCESS) => {
  const isAdmin = role === RoleEnum.ADMIN;

  if (type === TokenTypeEnum.ACCESS) {
    return {
      secret: isAdmin ? env.ACCESS_TOKEN_ADMIN_SECRET : env.ACCESS_TOKEN_USER_SECRET,
      expiresIn: isAdmin ? env.ACCESS_TOKEN_ADMIN_EXPIRATION : env.ACCESS_TOKEN_USER_EXPIRATION,
    };
  }

  return {
    secret: isAdmin ? env.REFRESH_TOKEN_ADMIN_SECRET : env.REFRESH_TOKEN_USER_SECRET,
    expiresIn: isAdmin ? env.REFRESH_TOKEN_ADMIN_EXPIRATION : env.REFRESH_TOKEN_USER_EXPIRATION,
  };
};

export const generateToken = ({ payload, signature, options = {} }: IGenerateToken): string => {
  const jwtConfig = getJwtConfig(payload.role, payload.type);
  const secret = signature || jwtConfig.secret;

  const targetExpiresIn = options.expiresIn ?? jwtConfig.expiresIn;

  const signOptions: SignOptions = { ...options };

  if (targetExpiresIn !== undefined && targetExpiresIn !== null) {
    signOptions.expiresIn = targetExpiresIn as NonNullable<SignOptions["expiresIn"]>;
  }

  return jwt.sign(payload, secret, signOptions);
};

export const verifyToken = ({ token, signature }: IVerifyToken): JwtPayload | string => {
  const secret = signature || env.ACCESS_TOKEN_USER_SECRET;
  return jwt.verify(token, secret);
};
