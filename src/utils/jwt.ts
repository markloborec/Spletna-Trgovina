import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";

dotenv.config(); // POSKRBIMO, da se .env naloži, preden beremo JWT_SECRET

const rawSecret = process.env.JWT_SECRET;

if (!rawSecret) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const JWT_SECRET: Secret = rawSecret;

export interface JwtPayload {
  userId: string;
  email: string;
  is_admin: boolean;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
