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
  Search,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks";
import type { Task } from "@/types";

interface GlobalTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export function GlobalTasksModal({ isOpen, onClose }: GlobalTasksModalProps) {
  const { user } = useAuth();
  const { tasks, setTasks, loading: tasksLoading, removeTasks } = useFirebaseTasks(user?.uid);
  
  const [newTask, setNewTask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
    removeTasks([taskId]); // optionally pass array if your hook expects array
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  };

  if (!isOpen) return null;

  const filteredTasks = tasks.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const completedCount = tasks.filter((t) => t.done).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-bg-primary border border-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-bg-secondary sticky top-0 z-20">
          <div className="flex flex-col">
            <h1
              className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              <ListTodo size={22} className="text-accent-primary" />
              Global Tasks
            </h1>
            <p className="text-xs text-text-secondary font-medium">Manage your focus workflow backlog</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Progress</span>
              <span className="text-sm font-bold text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                {completedCount} / {tasks.length}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-elevated border border-border text-text-tertiary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 overscroll-contain">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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
          </div>

          <div className="bg-bg-secondary border border-border rounded-3xl p-1 shadow-2xl mb-8">
            <div className="flex items-center gap-2 p-1">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Capture a new global task..."
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
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary" style={{ fontFamily: "var(--font-headline)" }}>
                  {searchQuery ? "Search Results" : "Live Backlog Feed"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-[10px] text-accent-primary font-bold font-mono">
                  {filteredTasks.length}
                </span>
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
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        task.done 
                          ? "bg-accent-secondary border-accent-secondary text-bg-primary" 
                          : "border-text-tertiary hover:border-accent-primary"
                      }`}
                    >
                      {task.done && <CheckCircle2 size={14} strokeWidth={3} />}
                    </button>

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
                      
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-2 text-text-tertiary hover:text-accent-danger opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
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
                      : "Your global backlog is empty. Start by capturing your first focus item above."}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
