import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notifications] = await pool.query(
    `SELECT * FROM Notifications WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 20`,
    [session.id]
  ) as any[];

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notificationId } = await req.json();

  if (notificationId) {
    await pool.query(
      "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ? AND UserID = ?",
      [notificationId, session.id]
    );
  } else {
    await pool.query(
      "UPDATE Notifications SET IsRead = 1 WHERE UserID = ?",
      [session.id]
    );
  }

  return NextResponse.json({ ok: true });
}
