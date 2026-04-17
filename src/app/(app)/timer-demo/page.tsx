"use client";

import { useState, useEffect } from "react";
import Timer from "@/components/session/Timer";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

export default function TimerDemoPage() {
  const TOTAL = 25 * 60; // 25 minutes
  const [remaining, setRemaining] = useState(TOTAL);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, remaining]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center z-10 gap-10">
      <h1
        className="text-2xl font-bold text-text-primary"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Timer Component Demo
      </h1>

      <Timer
        totalSeconds={TOTAL}
        remainingSeconds={remaining}
        isPaused={isPaused}
      />

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white font-semibold cursor-pointer"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? "Start" : "Pause"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setRemaining(TOTAL);
            setIsPaused(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-text-secondary hover:border-border-glow cursor-pointer"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          <RotateCcw size={18} />
          Reset
        </motion.button>
      </div>

      <p className="text-xs text-text-tertiary max-w-md text-center">
        The ring changes color as time runs out: violet (&gt;50%) → orange (20-50%) → red (&lt;20%).
        Colon blinks when paused.
      </p>
    </div>
  );
}
