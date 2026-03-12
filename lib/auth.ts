import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const SALT_ROUNDS = 12;
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("JWT_SECRET must be set in production");
  }
  return secret || "fallback-secret-change-in-production";
}
const JWT_SECRET = getJwtSecret();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function createToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.userId && decoded.email) {
      return { userId: decoded.userId, email: decoded.email };
    }
    return null;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(
  headers: Headers | Record<string, string | string[] | null | undefined>
): string | null {
  if (headers instanceof Headers) {
    const auth = headers.get("authorization");
    if (auth?.startsWith("Bearer ")) return auth.slice(7);
    return null;
  }
  const auth = headers["authorization"];
  const val = Array.isArray(auth) ? auth[0] : auth;
  if (typeof val === "string" && val.startsWith("Bearer ")) return val.slice(7);
  return null;
}
