import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const groupId = parseInt(id);

  const [membership] = await pool.query(
    "SELECT * FROM GroupMembers WHERE UserID = ? AND GroupID = ?",
    [session.id, groupId]
  ) as any[];
  if (!membership.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [[group], [members], [expenses]] = await Promise.all([
    pool.query(
      `SELECT ug.*, u.Name AS CreatorName
       FROM UserGroups ug
       JOIN Users u ON ug.CreatedByUserID = u.UserID
       WHERE ug.GroupID = ?`,
      [groupId]
    ) as Promise<any[]>,
    pool.query(
      `SELECT u.UserID, u.Name, u.Email, gm.IsAdmin, gm.JoinDate
       FROM GroupMembers gm
       JOIN Users u ON gm.UserID = u.UserID
       WHERE gm.GroupID = ?
       ORDER BY gm.IsAdmin DESC, u.Name ASC`,
      [groupId]
    ) as Promise<any[]>,
    pool.query(
      `SELECT e.*, u.Name AS PaidByName
       FROM Expenses e
       JOIN Users u ON e.PaidByUserID = u.UserID
       WHERE e.GroupID = ?
       ORDER BY e.Date DESC`,
      [groupId]
    ) as Promise<any[]>,
  ]);

  return NextResponse.json({
    group: group[0],
    members,
    expenses,
  });
}
