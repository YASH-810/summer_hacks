"use client";

import { useState, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowRight,
  Plus,
  Trash2,
  Trophy,
  Flame,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks";
import type { Task } from "@/types";

/* ─── Animation Variants ─── */
const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Helper ─── */
interface HistoryEntry {
  id: string;
  title: string;
  plannedMinutes: number;
  actualMinutes: number;
  tasksTotal: number;
  tasksCompleted: number;
  distractionCount: number;
  focusScore: number;
  startTime: string;
  endTime: string;
  focusMode?: string;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, setTasks, loading: tasksLoading } = useFirebaseTasks(user?.uid);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [newTask, setNewTask] = useState("");

  /* ── Fetch session history ── */
  useEffect(() => {
    if (!user) return;

    const historyRef = ref(rtdb, `users/${user.uid}/history`);
    const unsub = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const entries: HistoryEntry[] = Object.values(raw);
        // Sort by endTime descending (newest first)
        entries.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
        setHistory(entries);
      } else {
        setHistory([]);
      }
      setHistoryLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ── Task handlers ── */
  const addTask = useCallback(() => {
    const text = newTask.trim();
    if (!text) return;
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      done: false,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask("");
  }, [newTask, setTasks]);

  const removeTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [setTasks]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTask();
      }
    },
    [addTask]
  );

  /* ── Computed Analytics ── */
  const totalSessions = history.length;
  const totalFocusMinutes = history.reduce((sum, h) => sum + (h.actualMinutes || 0), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const totalTasksCompleted = history.reduce((sum, h) => sum + (h.tasksCompleted || 0), 0);
  const totalDistractions = history.reduce((sum, h) => sum + (h.distractionCount || 0), 0);
  const avgFocusScore =
    totalSessions > 0
      ? Math.round(history.reduce((sum, h) => sum + (h.focusScore || 0), 0) / totalSessions)
      : 0;

  /* ── Current streak (consecutive days with sessions) ── */
  const calculateStreak = (): number => {
    if (history.length === 0) return 0;
    const days = new Set(
      history.map((h) => new Date(h.endTime).toDateString())
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = calculateStreak();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <div className="relative min-h-screen flex flex-col z-10">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-primary/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <motion.main
        className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header ── */}
        <motion.div className="mb-8" variants={cardVariants}>
          <h1
            className="text-2xl md:text-3xl font-bold text-text-primary mb-1"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {greeting}, {user?.displayName?.split(" ")[0] || "Focus Master"}
          </h1>
          <p className="text-text-secondary text-sm">
            Here&apos;s your productivity overview and quick actions.
          </p>
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          variants={cardVariants}
        >
          {[
            { icon: CalendarDays, label: "Sessions", value: String(totalSessions), color: "var(--accent-primary)" },
            { icon: Clock, label: "Focus Hours", value: totalFocusHours, color: "var(--accent-primary)" },
            { icon: CheckCircle2, label: "Tasks Done", value: String(totalTasksCompleted), color: "var(--accent-secondary)" },
            { icon: AlertTriangle, label: "Distractions", value: String(totalDistractions), color: totalDistractions === 0 ? "var(--accent-secondary)" : "var(--accent-warning)" },
            { icon: Trophy, label: "Avg Score", value: String(avgFocusScore), color: avgFocusScore >= 70 ? "var(--accent-secondary)" : "var(--accent-warning)" },
            { icon: Flame, label: "Streak", value: `${streak}d`, color: streak > 0 ? "var(--accent-warning)" : "var(--text-tertiary)" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="bg-bg-secondary border border-border rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-border-glow transition-colors"
            >
              <stat.icon size={20} style={{ color: stat.color }} />
              <span
                className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {stat.label}
              </span>
              <span
                className="text-2xl font-bold text-text-primary"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {historyLoading ? "—" : stat.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Two-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ═══ LEFT — Quick Actions + Recent Sessions ═══ */}
          <div className="flex flex-col gap-6">
            {/* Start Session CTA */}
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 border border-accent-primary/30 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                  <Zap size={20} style={{ color: "var(--accent-primary)" }} />
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-text-primary"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    Ready to focus?
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Configure tasks, duration \u0026 mode.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/session/setup")}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-accent-primary text-white font-semibold text-sm hover:brightness-110 shadow-[0_0_25px_var(--focus-glow)] transition-all cursor-pointer"
              >
                Start New Session
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              variants={cardVariants}
              className="bg-bg-secondary border border-border rounded-2xl p-6 flex-1"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <CalendarDays size={18} style={{ color: "var(--accent-primary)" }} />
                <h3
                  className="text-sm font-semibold uppercase tracking-widest text-text-secondary"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Recent Sessions
                </h3>
              </div>

              <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
                {history.slice(0, 8).map((entry, i) => {
                  const scoreColor =
                    entry.focusScore >= 70
                      ? "var(--accent-secondary)"
                      : entry.focusScore >= 40
                      ? "var(--accent-warning)"
                      : "var(--accent-danger)";
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.04 }}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-bg-elevated border border-border hover:border-border-glow transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: scoreColor,
                          background: `color-mix(in srgb, ${scoreColor} 12%, transparent)`,
                        }}
                      >
                        {entry.focusScore}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {entry.title}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {entry.actualMinutes}m • {entry.tasksCompleted}/{entry.tasksTotal} tasks
                        </p>
                      </div>
                      <span
                        className="text-[10px] text-text-tertiary shrink-0"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {new Date(entry.endTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </motion.div>
                  );
                })}
                {history.length === 0 && !historyLoading && (
                  <div className="flex flex-col items-center justify-center py-10 text-text-tertiary">
                    <CalendarDays size={32} className="mb-3 opacity-40" />
                    <p className="text-sm">No sessions yet</p>
                    <p className="text-xs mt-1 opacity-60">
                      Complete your first session to see analytics here.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ═══ RIGHT — Global Tasks ═══ */}
          <motion.div
            variants={cardVariants}
            className="bg-bg-secondary border border-border rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <ListChecks size={18} style={{ color: "var(--accent-primary)" }} />
                <h3
                  className="text-sm font-semibold uppercase tracking-widest text-text-secondary"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Global Task Backlog
                </h3>
              </div>
              {tasks.length > 0 && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-bg-elevated text-text-secondary"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Add Task Input */}
            <div className="flex gap-2 mb-4">
              <input
                id="dashboard-new-task"
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a task to your backlog…"
                className="flex-1 bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-primary focus:shadow-[0_0_20px_var(--focus-glow)] transition-all duration-200 outline-none"
              />
              <motion.button
                id="dashboard-add-task-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTask}
                disabled={!newTask.trim()}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                style={{
                  boxShadow: newTask.trim()
                    ? "0 0 20px var(--focus-glow)"
                    : "none",
                }}
              >
                <Plus size={20} />
              </motion.button>
            </div>

            {/* Task List */}
            <div className="flex flex-col gap-2 flex-1 max-h-[420px] overflow-y-auto pr-1">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex items-center gap-3 bg-bg-elevated border border-border rounded-xl px-4 py-3 hover:border-border-glow transition-colors duration-200"
                >
                  <span
                    className="text-xs text-text-tertiary w-5 text-center shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-text-primary truncate">
                    {task.text}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-accent-danger hover:text-red-400 transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </motion.div>
              ))}
              {tasks.length === 0 && !tasksLoading && (
                <div className="flex flex-col items-center justify-center py-10 text-text-tertiary">
                  <ListChecks size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">Backlog is empty</p>
                  <p className="text-xs mt-1 opacity-60">
                    Add tasks here to import into future sessions.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
