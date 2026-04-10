import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

  const [groups] = await pool.query(
    "SELECT GroupID FROM UserGroups WHERE InviteCode = ?",
    [inviteCode]
  ) as any[];

  if (!groups.length) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  const groupId = groups[0].GroupID;

  const [existing] = await pool.query(
    "SELECT * FROM GroupMembers WHERE UserID = ? AND GroupID = ?",
    [session.id, groupId]
  ) as any[];

  if (existing.length) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  await pool.query(
    "INSERT INTO GroupMembers (UserID, GroupID, IsAdmin) VALUES (?, ?, 0)",
    [session.id, groupId]
  );

  return NextResponse.json({ groupId }, { status: 201 });
}
