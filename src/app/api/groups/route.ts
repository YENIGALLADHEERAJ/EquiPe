import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import crypto from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [groups] = await pool.query(
    `SELECT ug.GroupID, ug.GroupName, ug.Description, ug.CreationDate, ug.InviteCode,
            gm.IsAdmin,
            (SELECT COUNT(*) FROM GroupMembers WHERE GroupID = ug.GroupID) AS MemberCount,
            (SELECT COALESCE(SUM(Amount), 0) FROM Expenses WHERE GroupID = ug.GroupID AND IsSettled = 0) AS TotalExpenses
     FROM UserGroups ug
     JOIN GroupMembers gm ON ug.GroupID = gm.GroupID
     WHERE gm.UserID = ?
     ORDER BY ug.CreationDate DESC`,
    [session.id]
  ) as any[];

  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupName, description } = await req.json();
  if (!groupName) return NextResponse.json({ error: "Group name required" }, { status: 400 });

  const inviteCode = crypto.randomBytes(8).toString("hex");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      "INSERT INTO UserGroups (GroupName, Description, InviteCode, CreatedByUserID) VALUES (?, ?, ?, ?)",
      [groupName, description || null, inviteCode, session.id]
    ) as any[];
    const groupId = result.insertId;
    await conn.query(
      "INSERT INTO GroupMembers (UserID, GroupID, IsAdmin) VALUES (?, ?, 1)",
      [session.id, groupId]
    );
    await conn.commit();
    return NextResponse.json({ groupId, inviteCode }, { status: 201 });
  } catch {
    await conn.rollback();
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  } finally {
    conn.release();
  }
}
