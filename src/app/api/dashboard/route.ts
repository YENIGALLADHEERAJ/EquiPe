import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [ledger] = await pool.query(
    `SELECT
       SUM(CASE WHEN NetBalance > 0 THEN NetBalance ELSE 0 END) AS TotalOwed,
       SUM(CASE WHEN NetBalance < 0 THEN ABS(NetBalance) ELSE 0 END) AS TotalOwing,
       COUNT(DISTINCT GroupID) AS TotalGroups
     FROM GroupLedger
     WHERE UserID = ?`,
    [session.id]
  ) as any[];

  const [recentExpenses] = await pool.query(
    `SELECT e.ExpenseID, e.Amount, e.Description, e.Date, e.IsSettled,
            u.Name AS PaidByName, ug.GroupName
     FROM Expenses e
     JOIN Users u ON e.PaidByUserID = u.UserID
     JOIN UserGroups ug ON e.GroupID = ug.GroupID
     JOIN GroupMembers gm ON e.GroupID = gm.GroupID AND gm.UserID = ?
     ORDER BY e.Date DESC
     LIMIT 5`,
    [session.id]
  ) as any[];

  const [groupBalances] = await pool.query(
    `SELECT GroupID, GroupName,
            SUM(CASE WHEN NetBalance > 0 THEN NetBalance ELSE 0 END) AS Owed,
            SUM(CASE WHEN NetBalance < 0 THEN ABS(NetBalance) ELSE 0 END) AS Owing
     FROM GroupLedger
     WHERE UserID = ?
     GROUP BY GroupID, GroupName`,
    [session.id]
  ) as any[];

  return NextResponse.json({
    summary: ledger[0] || { TotalOwed: 0, TotalOwing: 0, TotalGroups: 0 },
    recentExpenses,
    groupBalances,
  });
}
