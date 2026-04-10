import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (groupId) {
    const [expenses] = await pool.query(
      `SELECT e.*, u.Name AS PaidByName
       FROM Expenses e
       JOIN Users u ON e.PaidByUserID = u.UserID
       WHERE e.GroupID = ?
       ORDER BY e.Date DESC`,
      [parseInt(groupId)]
    ) as any[];
    return NextResponse.json(expenses);
  }

  const [expenses] = await pool.query(
    `SELECT e.*, u.Name AS PaidByName, ug.GroupName
     FROM Expenses e
     JOIN Users u ON e.PaidByUserID = u.UserID
     JOIN UserGroups ug ON e.GroupID = ug.GroupID
     JOIN GroupMembers gm ON e.GroupID = gm.GroupID AND gm.UserID = ?
     ORDER BY e.Date DESC
     LIMIT 20`,
    [session.id]
  ) as any[];

  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId, amount, description, date } = await req.json();
  if (!groupId || !amount || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [membership] = await pool.query(
    "SELECT * FROM GroupMembers WHERE UserID = ? AND GroupID = ?",
    [session.id, groupId]
  ) as any[];
  if (!membership.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [result] = await pool.query(
    "INSERT INTO Expenses (GroupID, PaidByUserID, Amount, Description, Date) VALUES (?, ?, ?, ?, ?)",
    [groupId, session.id, parseFloat(amount), description, date || new Date()]
  ) as any[];

  return NextResponse.json({ expenseId: result.insertId }, { status: 201 });
}
