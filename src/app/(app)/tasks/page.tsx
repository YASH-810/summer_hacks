"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  LayoutGrid,
  ListTodo,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks";
import type { Task } from "@/types";

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

/* ═══════════════════════════════════════════════════════════════
   TASKS PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, setTasks, loading: tasksLoading } = useFirebaseTasks(user?.uid);
  
  const [newTask, setNewTask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Handlers ── */
  const addTask = useCallback(() => {
    const text = newTask.trim();
    if (!text) return;
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      done: false,
    };
    setTasks((prev) => [task, ...prev]);
    setNewTask("");
  }, [newTask, setTasks]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
          : t
      )
    );
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  };

  /* ── Derived ── */
  const filteredTasks = tasks.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const completedCount = tasks.filter((t) => t.done).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="relative min-h-screen flex flex-col z-10 font-sans">
      {/* ── Auth Guard & Loading ── */}
      {authLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary z-50">
          <div className="w-10 h-10 border-4 border-border border-t-accent-primary rounded-full animate-spin" />
        </div>
      )}

      {!authLoading && !user && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary z-50 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mb-6">
            <LayoutGrid className="text-text-tertiary" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-headline)" }}>
            Authentication Required
          </h2>
          <p className="text-text-secondary max-w-sm mb-8">
            Please log in to manage your synchronized task backlog across your devices.
          </p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl bg-accent-primary text-white font-semibold flex items-center shadow-[0_0_20px_var(--focus-glow)] cursor-pointer"
            >
              Sign In Now
            </motion.button>
          </Link>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-border bg-bg-primary/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/session/setup">
            <motion.div
              whileHover={{ x: -2 }}
              className="p-2 rounded-lg bg-bg-secondary border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </motion.div>
          </Link>
          <div className="flex flex-col">
            <h1
              className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              <ListTodo size={22} className="text-accent-primary" />
              Task Backlog
            </h1>
            <p className="text-xs text-text-secondary font-medium">Manage your focus workflow</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Progress</span>
            <span className="text-sm font-bold text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
              {completedCount} / {tasks.length}
            </span>
          </div>
          <div className="w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden border border-border">
            <motion.div
              className="h-full bg-accent-secondary"
              initial={{ width: 0 }}
              animate={{ width: tasks.length ? `${(completedCount / tasks.length) * 100}%` : 0 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-10 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* ═══ Action Bar ═══ */}
          <motion.section variants={itemVariants} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:shadow-[0_0_20px_var(--focus-glow)] transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Link href="/session/setup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-4 rounded-2xl bg-bg-secondary border border-border text-text-primary font-semibold flex items-center gap-2 hover:border-border-glow transition-all cursor-pointer"
                >
                  <LayoutGrid size={18} />
                  <span>Start Session</span>
                </motion.button>
              </Link>
            </div>
          </motion.section>

          {/* ═══ Quick Entry ═══ */}
          <motion.section variants={itemVariants} className="bg-bg-secondary border border-border rounded-3xl p-1 shadow-2xl">
            <div className="flex items-center gap-2 p-1">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Capture a new task..."
                  className="w-full bg-transparent border-none rounded-2xl px-6 py-4 text-lg text-text-primary placeholder:text-text-tertiary focus:ring-0 outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <kbd className="px-2 py-1 rounded bg-bg-elevated border border-border text-[10px] text-text-tertiary font-mono">ENTER</kbd>
                </div>
              </div>
              <motion.button
                onClick={addTask}
                disabled={!newTask.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-2xl bg-accent-primary text-white flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_20px_var(--focus-glow)] cursor-pointer"
              >
                <Plus size={24} strokeWidth={3} />
              </motion.button>
            </div>
          </motion.section>

          {/* ═══ Task List ═══ */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary" style={{ fontFamily: "var(--font-headline)" }}>
                  {searchQuery ? "Search Results" : "Live Feed"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-[10px] text-accent-primary font-bold font-mono">
                  {filteredTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-bold uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                  {completedCount} Done
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-bold uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-warning" />
                  {pendingCount} Pending
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 relative">
              <AnimatePresence mode="popLayout">
                {tasksLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex items-center justify-center py-10"
                  >
                    <div className="w-8 h-8 border-2 border-border border-t-accent-primary rounded-full animate-spin" />
                  </motion.div>
                ) : (
                  filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`group relative flex items-center gap-4 bg-bg-secondary/50 border rounded-2xl p-4 transition-all duration-300 ${
                      task.done ? "border-border/50 opacity-60" : "border-border hover:border-border-glow hover:bg-bg-secondary"
                    }`}
                  >
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => toggleTask(task.id)}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.done 
                          ? "bg-accent-secondary border-accent-secondary text-bg-primary" 
                          : "border-text-tertiary hover:border-accent-primary"
                      }`}
                    >
                      {task.done && <CheckCircle2 size={14} strokeWidth={3} />}
                    </motion.button>

                    <span className={`flex-1 text-base transition-all ${task.done ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                      {task.text}
                    </span>

                    <div className="flex items-center gap-2">
                      <AnimatePresence>
                        {task.done && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] font-mono text-accent-secondary bg-accent-secondary/10 px-2 py-1 rounded-md"
                          >
                            COMPLETED
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, color: "var(--accent-danger)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeTask(task.id)}
                        className="p-2 text-text-tertiary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                )))}
              </AnimatePresence>

              {!tasksLoading && filteredTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-6 text-center bg-bg-secondary/20 border border-dashed border-border rounded-3xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4 border border-border">
                    <Sparkles className="text-text-tertiary" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1" style={{ fontFamily: "var(--font-headline)" }}>
                    {searchQuery ? "No matches found" : "Void Detected"}
                  </h3>
                  <p className="text-sm text-text-secondary max-w-[240px]">
                    {searchQuery 
                      ? `We couldn't find any tasks matching "${searchQuery}"`
                      : "Your task backlog is empty. Start by capturing your first focus item above."}
                  </p>
                </motion.div>
              )}
            </div>
          </section>
        </motion.div>
      </main>

      {/* ── Background Grid ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }} 
        />
      </div>
    </div>
  );
}
