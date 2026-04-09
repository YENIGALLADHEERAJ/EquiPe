import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createSessionCookie } from "@/lib/session";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const hashed = crypto.createHash("sha256").update(password).digest("hex");
  try {
    const [result] = await pool.query(
      "INSERT INTO Users (Name, Email, Password, Phone) VALUES (?, ?, ?, ?)",
      [name, email, hashed, phone || null]
    ) as any[];
    const userId = result.insertId;
    const sessionValue = createSessionCookie({ id: userId, name, email });
    const res = NextResponse.json({ user: { id: userId, name, email } }, { status: 201 });
    res.cookies.set("session", sessionValue, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return res;
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
