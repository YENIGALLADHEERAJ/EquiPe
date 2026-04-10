"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
  UserID: number;
  Name: string;
}

interface Props {
  groupId: number;
  members: Member[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddExpenseModal({ groupId, members, onClose, onSuccess }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, description, amount: parseFloat(amount), date }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add expense");
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={onClose}
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
            <h2 className="text-xl font-bold text-white">Add Expense</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none border border-white/8"
                placeholder="e.g. Dinner at Nobu"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none border border-white/8"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/8"
              />
            </div>

            <div className="text-xs text-white/30 glass rounded-xl px-4 py-3">
              Splitting equally among {members.length} member{members.length !== 1 ? "s" : ""}.
              Each owes{" "}
              <span className="text-cyan-400 font-semibold">
                ${amount ? (parseFloat(amount) / members.length).toFixed(2) : "0.00"}
              </span>
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 pill-btn glass text-white/60 hover:text-white text-sm py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 pill-btn bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3 disabled:opacity-50 text-sm"
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
