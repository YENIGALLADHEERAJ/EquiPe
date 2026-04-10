"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import AddExpenseModal from "@/components/AddExpenseModal";
import SettleUpModal from "@/components/SettleUpModal";
import { SessionUser } from "@/lib/session";

interface Group {
  GroupID: number;
  GroupName: string;
  Description: string;
  InviteCode: string;
  CreatorName: string;
  CreationDate: string;
}

interface Member {
  UserID: number;
  Name: string;
  Email: string;
  IsAdmin: number;
  JoinDate: string;
}

interface Expense {
  ExpenseID: number;
  Amount: number;
  Description: string;
  Date: string;
  IsSettled: number;
  PaidByName: string;
  PaidByUserID: number;
}

interface Settlement {
  SettlementID: number;
  Amount: number;
  Date: string;
  Status: string;
  PayerName: string;
  ReceiverName: string;
}

interface Props {
  groupId: number;
  session: SessionUser;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function GroupClient({ groupId, session }: Props) {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "members" | "settlements">("expenses");
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupRes, settlementsRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/settlements?groupId=${groupId}`),
      ]);
      if (groupRes.ok) {
        const data = await groupRes.json();
        setGroup(data.group);
        setMembers(data.members);
        setExpenses(data.expenses);
      }
      if (settlementsRes.ok) setSettlements(await settlementsRes.json());
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function copyInviteCode() {
    if (group) {
      navigator.clipboard.writeText(group.InviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.Amount), 0);
  const myShare = members.length > 0 ? totalExpenses / members.length : 0;
  const iPaid = expenses
    .filter((e) => e.PaidByUserID === session.id)
    .reduce((sum, e) => sum + Number(e.Amount), 0);
  const netBalance = iPaid - myShare;

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <AuroraBackground />
        <Navbar userName={session.name} />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-white/40 text-sm animate-pulse">Loading group...</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <AuroraBackground />
        <Navbar userName={session.name} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/40 text-sm">Group not found or access denied.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AuroraBackground />
      <Navbar userName={session.name} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/dashboard" className="text-xs text-white/30 hover:text-white/60 transition-colors mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{group.GroupName}</h1>
              {group.Description && <p className="text-white/40 text-sm mt-1">{group.Description}</p>}
              <p className="text-xs text-white/20 mt-1">Created by {group.CreatorName}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyInviteCode}
                className="pill-btn glass text-white/60 hover:text-white text-xs py-2 px-4 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copiedCode ? "Copied!" : `Code: ${group.InviteCode}`}
              </button>
              <button
                onClick={() => setShowSettle(true)}
                className="pill-btn bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs py-2 px-4"
              >
                Settle Up
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="pill-btn bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs py-2 px-4"
              >
                + Add Expense
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Expenses", value: `$${totalExpenses.toFixed(2)}`, color: "from-violet-500 to-indigo-500" },
            { label: "Your Share", value: `$${myShare.toFixed(2)}`, color: "from-cyan-500 to-blue-500" },
            {
              label: "Your Net Balance",
              value: `${netBalance >= 0 ? "+" : ""}$${netBalance.toFixed(2)}`,
              color: netBalance >= 0 ? "from-emerald-500 to-cyan-500" : "from-red-500 to-orange-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass rounded-2xl p-5 glow-border"
            >
              <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-1 glass rounded-2xl p-1 w-fit">
          {(["expenses", "members", "settlements"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {activeTab === "expenses" && (
            <>
              {expenses.length === 0 ? (
                <div className="text-center text-white/20 text-sm py-16">
                  No expenses yet. Add your first one!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Description</th>
                        <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Paid By</th>
                        <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Date</th>
                        <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Amount</th>
                        <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp, i) => (
                        <motion.tr
                          key={exp.ExpenseID}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-white/90">{exp.Description}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{exp.PaidByName}</td>
                          <td className="px-6 py-4 text-xs text-white/40">
                            {new Date(exp.Date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-cyan-400 text-right">
                            ${Number(exp.Amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${
                              exp.IsSettled
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-orange-500/15 text-orange-400"
                            }`}>
                              {exp.IsSettled ? "Settled" : "Pending"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === "members" && (
            <div className="divide-y divide-white/5">
              {members.map((member, i) => (
                <motion.div
                  key={member.UserID}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center text-sm font-semibold text-white/80">
                      {member.Name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {member.Name}
                        {member.UserID === session.id && (
                          <span className="ml-2 text-xs text-white/30">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-white/30">{member.Email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.IsAdmin ? (
                      <span className="text-[10px] font-medium text-violet-400 glass rounded-full px-2 py-0.5">Admin</span>
                    ) : null}
                    <span className="text-xs text-white/20">
                      Joined {new Date(member.JoinDate).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "settlements" && (
            <>
              {settlements.length === 0 ? (
                <div className="text-center text-white/20 text-sm py-16">
                  No settlements yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">From</th>
                        <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">To</th>
                        <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Date</th>
                        <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Amount</th>
                        <th className="text-right text-xs font-semibold text-white/40 uppercase tracking-widest px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements.map((s, i) => (
                        <motion.tr
                          key={s.SettlementID}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-white/90">{s.PayerName}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{s.ReceiverName}</td>
                          <td className="px-6 py-4 text-xs text-white/40">
                            {new Date(s.Date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-emerald-400 text-right">
                            ${Number(s.Amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs rounded-full px-2.5 py-1 font-medium bg-emerald-500/15 text-emerald-400">
                              {s.Status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      {showAddExpense && (
        <AddExpenseModal
          groupId={groupId}
          members={members}
          onClose={() => setShowAddExpense(false)}
          onSuccess={fetchData}
        />
      )}

      {showSettle && (
        <SettleUpModal
          groupId={groupId}
          members={members}
          currentUserId={session.id}
          onClose={() => setShowSettle(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
