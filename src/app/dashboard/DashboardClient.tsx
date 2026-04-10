"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import { SessionUser } from "@/lib/session";

interface DashboardSummary {
  TotalOwed: number;
  TotalOwing: number;
  TotalGroups: number;
}

interface Expense {
  ExpenseID: number;
  Amount: number;
  Description: string;
  Date: string;
  IsSettled: number;
  PaidByName: string;
  GroupName: string;
}

interface GroupBalance {
  GroupID: number;
  GroupName: string;
  Owed: number;
  Owing: number;
}

interface Group {
  GroupID: number;
  GroupName: string;
  Description: string;
  InviteCode: string;
  IsAdmin: number;
  MemberCount: number;
  TotalExpenses: number;
}

interface Props {
  session: SessionUser;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function DashboardClient({ session }: Props) {
  const [summary, setSummary] = useState<DashboardSummary>({ TotalOwed: 0, TotalOwing: 0, TotalGroups: 0 });
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [groupBalances, setGroupBalances] = useState<GroupBalance[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, groupsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/groups"),
      ]);
      if (dashRes.ok) {
        const dash = await dashRes.json();
        setSummary(dash.summary);
        setRecentExpenses(dash.recentExpenses);
        setGroupBalances(dash.groupBalances);
      }
      if (groupsRes.ok) setGroups(await groupsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setActionError("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, description: groupDesc }),
      });
      const data = await res.json();
      if (!res.ok) { setActionError(data.error || "Failed to create group"); }
      else { setShowCreateGroup(false); setGroupName(""); setGroupDesc(""); fetchData(); }
    } catch { setActionError("Network error"); }
    finally { setActionLoading(false); }
  }

  async function joinGroup(e: React.FormEvent) {
    e.preventDefault();
    setActionError("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) { setActionError(data.error || "Failed to join group"); }
      else { setShowJoinGroup(false); setInviteCode(""); fetchData(); }
    } catch { setActionError("Network error"); }
    finally { setActionLoading(false); }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <AuroraBackground />
      <Navbar userName={session.name} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-white mb-1">
            Good to see you, <span className="gradient-text">{session.name.split(" ")[0]}</span>
          </h1>
          <p className="text-white/30 text-sm">Here&apos;s your financial snapshot</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "You are owed", value: summary.TotalOwed, color: "from-emerald-500 to-cyan-500", sign: "+" },
            { label: "You owe", value: summary.TotalOwing, color: "from-red-500 to-orange-500", sign: "-" },
            { label: "Active groups", value: summary.TotalGroups, color: "from-violet-500 to-indigo-500", sign: "", isCount: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass rounded-2xl p-6 glow-border"
            >
              <p className="text-xs text-white/40 font-medium mb-3 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.isCount ? stat.value : `${stat.sign}$${Number(stat.value).toFixed(2)}`}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Recent Expenses</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 glass rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentExpenses.length === 0 ? (
              <p className="text-center text-white/20 text-sm py-8">No expenses yet</p>
            ) : (
              <div className="space-y-2">
                {recentExpenses.map((exp) => (
                  <div key={exp.ExpenseID} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white/90">{exp.Description}</p>
                      <p className="text-xs text-white/30">{exp.GroupName} · {exp.PaidByName}</p>
                    </div>
                    <span className="text-sm font-semibold text-cyan-400">${Number(exp.Amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Balance by Group</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 glass rounded-xl animate-pulse" />)}
              </div>
            ) : groupBalances.length === 0 ? (
              <p className="text-center text-white/20 text-sm py-8">No group balances</p>
            ) : (
              <div className="space-y-3">
                {groupBalances.map((gb) => (
                  <div key={gb.GroupID} className="glass rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-white/80 mb-2">{gb.GroupName}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-emerald-400">+${Number(gb.Owed).toFixed(2)} owed to you</span>
                      <span className="text-red-400">-${Number(gb.Owing).toFixed(2)} you owe</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Your Groups</h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowJoinGroup(true); setActionError(""); }}
                className="pill-btn glass text-white/60 hover:text-white text-xs py-2 px-4"
              >
                Join Group
              </button>
              <button
                onClick={() => { setShowCreateGroup(true); setActionError(""); }}
                className="pill-btn bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs py-2 px-4"
              >
                + Create
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-28 glass rounded-xl animate-pulse" />)}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-center text-white/20 text-sm py-8">No groups yet. Create or join one!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g, i) => (
                <motion.div key={g.GroupID} whileHover={{ y: -4, scale: 1.01 }}>
                  <Link href={`/groups/${g.GroupID}`}>
                    <div className="glass rounded-xl p-4 glow-border h-full cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">{g.GroupName}</h3>
                        {g.IsAdmin ? (
                          <span className="text-[10px] font-medium text-violet-400 glass rounded-full px-2 py-0.5">Admin</span>
                        ) : null}
                      </div>
                      <div className="flex gap-4 text-xs text-white/40">
                        <span>{g.MemberCount} members</span>
                        <span>${Number(g.TotalExpenses).toFixed(2)} total</span>
                      </div>
                      <p className="text-[10px] text-white/20 mt-2 font-mono">{g.InviteCode}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {(showCreateGroup || showJoinGroup) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => { setShowCreateGroup(false); setShowJoinGroup(false); }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="relative glass-strong rounded-3xl p-8 w-full max-w-md space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {showCreateGroup ? "Create Group" : "Join Group"}
                </h2>
                <button
                  onClick={() => { setShowCreateGroup(false); setShowJoinGroup(false); }}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {showCreateGroup && (
                <form onSubmit={createGroup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none border border-white/8"
                      placeholder="e.g. NYC Trip 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Description (optional)</label>
                    <input
                      type="text"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none border border-white/8"
                      placeholder="What's this group for?"
                    />
                  </div>
                  {actionError && <p className="text-xs text-red-400 text-center">{actionError}</p>}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full pill-btn bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3 disabled:opacity-50"
                  >
                    {actionLoading ? "Creating..." : "Create Group"}
                  </button>
                </form>
              )}

              {showJoinGroup && (
                <form onSubmit={joinGroup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Invite Code</label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none border border-white/8 font-mono"
                      placeholder="Enter 16-character code"
                      maxLength={16}
                    />
                  </div>
                  {actionError && <p className="text-xs text-red-400 text-center">{actionError}</p>}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full pill-btn bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 disabled:opacity-50"
                  >
                    {actionLoading ? "Joining..." : "Join Group"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
