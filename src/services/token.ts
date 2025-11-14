import jwt from "jsonwebtoken"
import { jwtConfig } from "../config/jwt"
import type { TokenPayload, UserRole } from "../types"

// Generate JWT access token
export const generateAccessToken = (id: string, email: string, role: UserRole): string => {
  const token  = jwt.sign({ id, email, role }, jwtConfig.accessTokenSecret, { expiresIn: "7d" });
  return token;
}

// Verify JWT access token
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as TokenPayload
}
