import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as SessionUser;
  } catch {
    return null;
  }
}

export function createSessionCookie(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}
