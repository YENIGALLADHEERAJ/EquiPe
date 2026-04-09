"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AuroraBackground from "@/components/AuroraBackground";

const mockStats = [
  { label: "Total Saved", value: "$4,280", color: "from-violet-500 to-indigo-500" },
  { label: "Groups Active", value: "12", color: "from-cyan-500 to-blue-500" },
  { label: "Settled This Month", value: "$1,840", color: "from-purple-500 to-pink-500" },
  { label: "Avg. Split", value: "$94", color: "from-indigo-500 to-cyan-500" },
];

const mockExpenses = [
  { desc: "Dinner at Nobu", amount: "$320", group: "NYC Trip", user: "Alex" },
  { desc: "Airbnb 3 nights", amount: "$1,200", group: "Beach House", user: "Sam" },
  { desc: "Uber Pool x4", amount: "$48", group: "Work Crew", user: "Jordan" },
  { desc: "Groceries run", amount: "$156", group: "Roommates", user: "Priya" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      <AuroraBackground />

      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-6 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">EquiPe</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/login"
            className="text-white/70 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="pill-btn glass text-white text-sm glow-border"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-white/60 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Smart Expense Settlement Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            Split the bill.
            <br />
            <span className="gradient-text">Keep the peace.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-white/50 max-w-md leading-relaxed"
          >
            EquiPe makes group expenses effortless. Track, split, and settle
            debts in real-time with your friends, roommates, or colleagues.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/register"
              className="pill-btn bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:shadow-violet-700/50 hover:scale-105"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="pill-btn glass text-white/80 hover:text-white glow-border"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6 pt-2"
          >
            {["No credit card", "Free forever", "Instant setup"].map((text) => (
              <span key={text} className="flex items-center gap-2 text-xs text-white/40">
                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="flex-1 w-full max-w-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {mockStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass rounded-2xl p-5 glow-border"
              >
                <p className="text-xs text-white/40 font-medium mb-2">{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="glass rounded-2xl p-5 space-y-3 float-card"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                Recent Activity
              </p>
              <span className="text-xs text-white/30">Live</span>
            </div>
            {mockExpenses.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-white/90">{exp.desc}</p>
                  <p className="text-xs text-white/30">
                    {exp.group} · paid by {exp.user}
                  </p>
                </div>
                <span className="text-sm font-semibold text-cyan-400">{exp.amount}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-text">settle up</span>
          </h2>
          <p className="text-white/40 max-w-md mx-auto">
            A complete toolkit for managing shared expenses with elegance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Instant Splitting",
              desc: "Add an expense and EquiPe automatically calculates who owes what across your group.",
            },
            {
              icon: "🔔",
              title: "Smart Notifications",
              desc: "Real-time alerts when expenses are added or settlements are received.",
            },
            {
              icon: "📊",
              title: "Live Ledger",
              desc: "A powerful dashboard showing your exact balance across all groups at a glance.",
            },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass rounded-2xl p-8 glow-border"
            >
              <div className="text-4xl mb-4">{feat.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="w-full border-t border-white/5 py-8 px-6 text-center text-white/20 text-sm">
        © 2024 EquiPe. Built for splitting with style.
      </footer>
    </main>
  );
}
