"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/* ─── Props ─── */
interface TimerProps {
  /** Total session duration in seconds */
  totalSeconds: number;
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Optional size in pixels (default: 280) */
  size?: number;
  /** Optional stroke width (default: 6) */
  strokeWidth?: number;
  /** Whether the session is paused */
  isPaused?: boolean;
}

/* ─── Helpers ─── */
function formatTime(seconds: number): { hours: string; minutes: string; secs: string } {
  const maxLimit = 24 * 3600; 
  const clamped = Math.min(maxLimit, Math.max(0, Math.floor(seconds)));
  
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  
  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    secs: String(s).padStart(2, "0"),
  };
}

function getPhaseColor(progress: number): string {
  if (progress > 0.5) return "var(--accent-primary)";    // > 50% — violet
  if (progress > 0.2) return "var(--accent-warning)";    // 20-50% — orange
  return "var(--accent-danger)";                          // < 20% — red
}

function getPhaseGlow(progress: number): string {
  if (progress > 0.5) return "var(--focus-glow)";
  if (progress > 0.2) return "var(--warning-glow)";
  return "rgba(255, 71, 87, 0.15)";
}

/* ═══════════════════════════════════════════════════════════════
   TIMER COMPONENT — Circular progress ring with countdown
   ═══════════════════════════════════════════════════════════════ */
export default function Timer({
  totalSeconds,
  remainingSeconds,
  size = 280,
  strokeWidth = 6,
  isPaused = false,
}: TimerProps) {
  /* ── Geometry ── */
  const center = size / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;

  /* ── Progress ── */
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const elapsed = totalSeconds - remainingSeconds;

  /* ── Dynamic colors based on time remaining ── */
  const ringColor = getPhaseColor(progress);
  const glowColor = getPhaseGlow(progress);

  /* ── Formatted time ── */
  const { hours, minutes, secs } = useMemo(
    () => formatTime(remainingSeconds),
    [remainingSeconds]
  );

  /* ── Percentage for display ── */
  const percentComplete = Math.round((1 - progress) * 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* ── Outer glow ring (ambient) ── */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
          transition: "box-shadow 1s ease",
        }}
      />

      {/* ── SVG Ring ── */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          opacity={0.5}
        />

        {/* Subtle tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 360) / 60;
          const isMajor = i % 5 === 0;
          const tickRadius = radius + strokeWidth + 2;
          const tickLength = isMajor ? 8 : 4;
          const x1 = center + tickRadius * Math.cos((angle * Math.PI) / 180);
          const y1 = center + tickRadius * Math.sin((angle * Math.PI) / 180);
          const x2 =
            center +
            (tickRadius + tickLength) * Math.cos((angle * Math.PI) / 180);
          const y2 =
            center +
            (tickRadius + tickLength) * Math.sin((angle * Math.PI) / 180);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? "var(--border-glow)" : "var(--border)"}
              strokeWidth={isMajor ? 1.5 : 0.75}
              opacity={isMajor ? 0.6 : 0.3}
            />
          );
        })}

        {/* Progress ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${ringColor})`,
          }}
        />

        {/* Leading dot on the progress ring */}
        {progress > 0.01 && progress < 0.99 && (
          <motion.circle
            cx={center + radius * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
            cy={center + radius * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
            r={strokeWidth * 1.2}
            fill={ringColor}
            animate={{
              cx: center + radius * Math.cos(2 * Math.PI * progress - Math.PI / 2),
              cy: center + radius * Math.sin(2 * Math.PI * progress - Math.PI / 2),
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              filter: `drop-shadow(0 0 6px ${ringColor})`,
            }}
          />
        )}
      </svg>

      {/* ── Center Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Time Display */}
        <div className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-mono)" }}>
          {/* Hours */}
          <span className="text-5xl font-bold text-text-primary tracking-tight">
            {hours}
          </span>

          {/* First Colon */}
          <motion.span
            animate={{ opacity: isPaused ? [1, 0.3, 1] : 1 }}
            transition={isPaused ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
            className="text-4xl font-bold"
            style={{ color: ringColor }}
          >
            :
          </motion.span>

          {/* Minutes */}
          <span className="text-5xl font-bold text-text-primary tracking-tight">
            {minutes}
          </span>

          {/* Second Colon */}
          <motion.span
            animate={{ opacity: isPaused ? [1, 0.3, 1] : 1 }}
            transition={isPaused ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
            className="text-4xl font-bold"
            style={{ color: ringColor }}
          >
            :
          </motion.span>

          {/* Seconds */}
          <span className="text-5xl font-bold text-text-primary tracking-tight">
            {secs}
          </span>
        </div>

        {/* Status Label */}
        <div className="mt-2 flex items-center gap-2">
          {isPaused ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs font-medium uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-headline)",
                color: "var(--accent-warning)",
              }}
            >
              Paused
            </motion.span>
          ) : (
            <span
              className="text-xs font-medium uppercase tracking-widest text-text-secondary"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {remainingSeconds <= 0 ? "Complete" : "Focusing"}
            </span>
          )}
        </div>

        {/* Progress percentage */}
        <span
          className="mt-1 text-[10px] text-text-tertiary"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {percentComplete}% elapsed
        </span>
      </div>
    </div>
  );
}
