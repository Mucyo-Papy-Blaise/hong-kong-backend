/**
 * JWT configuration constants
 */
export const jwtConfig = {
  accessTokenSecret: process.env.JWT_SECRET || "default-secret-change-this",
  accessTokenExpiry: process.env.JWT_EXPIRES_IN || "7d",
}
