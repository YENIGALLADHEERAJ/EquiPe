import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (groupId) {
    const [rows] = await pool.query(
      `SELECT s.*, u1.Name AS PayerName, u2.Name AS ReceiverName
       FROM Settlements s
       JOIN Users u1 ON s.PayerUserID = u1.UserID
       JOIN Users u2 ON s.ReceiverUserID = u2.UserID
       WHERE s.GroupID = ?
       ORDER BY s.Date DESC`,
      [parseInt(groupId)]
    ) as any[];
    return NextResponse.json(rows);
  }

  const [rows] = await pool.query(
    `SELECT s.*, u1.Name AS PayerName, u2.Name AS ReceiverName, ug.GroupName
     FROM Settlements s
     JOIN Users u1 ON s.PayerUserID = u1.UserID
     JOIN Users u2 ON s.ReceiverUserID = u2.UserID
     JOIN UserGroups ug ON s.GroupID = ug.GroupID
     WHERE s.PayerUserID = ? OR s.ReceiverUserID = ?
     ORDER BY s.Date DESC
     LIMIT 20`,
    [session.id, session.id]
  ) as any[];

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId, receiverUserId, amount } = await req.json();
  if (!groupId || !receiverUserId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [membership] = await pool.query(
    "SELECT * FROM GroupMembers WHERE UserID = ? AND GroupID = ?",
    [session.id, groupId]
  ) as any[];
  if (!membership.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [result] = await pool.query(
    "INSERT INTO Settlements (GroupID, PayerUserID, ReceiverUserID, Amount, Status) VALUES (?, ?, ?, ?, 'completed')",
    [groupId, session.id, receiverUserId, parseFloat(amount)]
  ) as any[];

  return NextResponse.json({ settlementId: result.insertId }, { status: 201 });
}
