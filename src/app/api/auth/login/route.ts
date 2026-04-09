import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const [rows] = await pool.query(
    "SELECT UserID, Name, Email, Password FROM Users WHERE Email = ?",
    [email]
  ) as any[];
  if (!rows.length) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.Password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const sessionValue = createSessionCookie({ id: user.UserID, name: user.Name, email: user.Email });
  const res = NextResponse.json({ user: { id: user.UserID, name: user.Name, email: user.Email } });
  res.cookies.set("session", sessionValue, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
}
