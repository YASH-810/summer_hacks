"use client";

import { useState, useEffect } from "react";
import Timer from "@/components/session/Timer";
import { motion } from "framer-motion";
import { Coffee, Flag, AlertTriangle, CheckCircle2, Circle, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock tasks (eventually fetched from Firestore via useSession hook)
const MOCK_TASKS = [
  { id: 1, text: "Set up Firebase schema", done: true },
  { id: 2, text: "Build Active Session UI", done: false },
  { id: 3, text: "Link PC + Phone events", done: false },
];

const MOCK_LOGS = [
  { id: 1, time: "10:05", message: "Session started", type: "system" },
  { id: 2, time: "10:12", message: "Phone picked up", type: "distraction" },
  { id: 3, time: "10:14", message: "Phone locked", type: "success" },
  { id: 4, time: "10:20", message: "Tab visibility lost", type: "distraction" }
];

export default function ActiveSessionPage() {
  const router = useRouter();
  const TOTAL = 45 * 60; // 45 minutes
  const [remaining, setRemaining] = useState(TOTAL);
  const [isPaused, setIsPaused] = useState(false);
  const [tasks, setTasks] = useState(MOCK_TASKS);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, remaining]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const endSession = () => {
    // Navigate to debrief page, we can use a dummy ID for now
    router.push("/debrief/DEMO-SESSION-123");
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 relative z-10 hidden-scrollbar overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* LEFT: Task Checklist */}
      <div className="hidden lg:flex flex-col gap-6 pt-10">
        <div>
          <h2 className="text-sm font-bold text-text-secondary tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-headline)" }}>Current Objectives</h2>
          <div className="h-[1px] w-full bg-border border-b border-border/50 mt-3 mb-4 shrink-0" />
        </div>
        
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${task.done ? "bg-accent-secondary/5 border-accent-secondary/20 shadow-[0_0_15px_rgba(0,212,170,0.05)]" : "bg-bg-secondary border-border hover:border-accent-primary/40 hover:shadow-[0_0_20px_rgba(108,99,255,0.08)]"}`}
            >
              {task.done ? (
                <CheckCircle2 className="w-5 h-5 text-accent-secondary shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-text-tertiary group-hover:text-accent-primary shrink-0 mt-0.5 transition-colors" />
              )}
              <span className={`text-sm tracking-wide ${task.done ? "text-text-secondary line-through opacity-60" : "text-text-primary"}`}>
                {task.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CENTER: Timer & Controls */}
      <div className="flex flex-col items-center justify-center pt-8 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(108,99,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            STRICT MODE ACTIVE
          </span>
        </motion.div>

        <motion.div
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Timer
            totalSeconds={TOTAL}
            remainingSeconds={remaining}
            isPaused={isPaused}
          />
        </motion.div>

      </div>

      {/* RIGHT: Live Event Log */}
      <div className="hidden lg:flex flex-col gap-6 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-secondary tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-headline)" }}>Live Event Log</h2>
          <Activity className="w-4 h-4 text-text-tertiary" />
        </div>
        <div className="h-[1px] w-full bg-border border-b border-border/50 shrink-0 mb-2" />

        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {MOCK_LOGS.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={log.id} 
              className="flex gap-4 text-sm items-start"
            >
              <span className="text-text-tertiary w-12 shrink-0 tabular-nums font-medium tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                {log.time}
              </span>
              <span className={`leading-relaxed ${
                log.type === "distraction" ? "text-accent-warning bg-accent-warning/10 px-2 py-0.5 rounded-md" :
                log.type === "success" ? "text-accent-secondary" : "text-text-secondary"
              }`}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR: Fixed Controls */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-bg-secondary/70 backdrop-blur-2xl border-t border-border flex items-center justify-center gap-4 sm:gap-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-accent-warning/50 text-accent-warning hover:bg-accent-warning/10 hover:border-accent-warning transition-colors font-medium text-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">I got distracted</span>
          <span className="sm:hidden">Distracted</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(!isPaused)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-medium text-sm ${isPaused ? "bg-accent-secondary text-bg-primary border-accent-secondary shadow-[0_0_20px_rgba(0,212,170,0.3)]" : "bg-bg-elevated border-border hover:border-text-secondary text-text-primary"}`}
        >
          {isPaused ? <Coffee className="w-4 h-4 fill-current text-bg-primary" /> : <Coffee className="w-4 h-4" />}
          {isPaused ? "Resume Session" : "Take Break"}
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endSession}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white hover:brightness-110 shadow-[0_0_20px_rgba(108,99,255,0.2)] transition-all font-medium text-sm cursor-pointer"
        >
          <Flag className="w-4 h-4" />
          End Session
        </motion.button>
      </div>
    </div>
  );
}
