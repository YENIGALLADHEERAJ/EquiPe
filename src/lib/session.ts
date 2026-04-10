import { cookies } from "next/headers";
import crypto from "crypto";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

const DEFAULT_SECRET = "equipe-default-secret-change-in-production";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable must be set in production");
    }
    console.warn("[EquiPe] SESSION_SECRET not set. Using default — DO NOT use in production.");
    return DEFAULT_SECRET;
  }
  return secret;
}

function hmacSign(data: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(data).digest("hex");
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;
  try {
    const parts = raw.split(".");
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expected = hmacSign(encoded);
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as SessionUser;
  } catch {
    return null;
  }
}

export function createSessionCookie(user: SessionUser): string {
  const encoded = Buffer.from(JSON.stringify(user)).toString("base64");
  const sig = hmacSign(encoded);
  return `${encoded}.${sig}`;
}
