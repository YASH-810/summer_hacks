"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Brain,
  Activity,
  Shield,
  Zap,
  ArrowRight,
  Eye,
  BarChart3,
  ChevronDown,
  Sparkles,
  Timer,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRef } from "react";

/* ────────────────────────────────────────────
   Animation presets
   ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ────────────────────────────────────────────
   Landing Page
   ──────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="flex flex-col min-h-screen relative z-10 overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <Navbar />

      {/* ─── Hero ─── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex flex-col items-center justify-center pt-36 pb-24 px-6 text-center"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent-primary/[0.06] blur-[120px] pointer-events-none" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-border bg-bg-secondary/60 backdrop-blur-sm text-xs font-medium text-text-secondary tracking-wide"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
          <span>Powered by Gemini AI</span>
          <span className="w-1 h-1 rounded-full bg-accent-secondary animate-pulse" />
          <span className="text-accent-secondary">Live</span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight max-w-4xl"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Stop managing
          <br />
          distractions.
          <br />
          <span className="bg-gradient-to-r from-accent-primary via-[#9b8aff] to-accent-secondary bg-clip-text text-transparent">
            Start understanding&nbsp;them.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-6 text-lg sm:text-xl text-text-secondary max-w-xl leading-relaxed"
        >
          FocusOS tracks your attention across PC&nbsp;and&nbsp;phone, detects
          distractions in real-time, and uses AI to coach you back into
          deep&nbsp;work.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="/login"
            id="hero-cta"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent-primary text-white font-semibold text-base shadow-[0_0_30px_rgba(108,99,255,0.35)] hover:shadow-[0_0_50px_rgba(108,99,255,0.5)] hover:brightness-110 transition-all duration-300"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-it-works"
            id="hero-learn-more"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-text-secondary hover:border-border-glow hover:text-text-primary transition-all duration-300 text-base"
          >
            See how it works
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>

        {/* ─── Animated Mockup ─── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="mt-20 w-full max-w-5xl"
        >
          <DeviceMockup />
        </motion.div>
      </motion.section>

      {/* ─── Stats Bar ─── */}
      <StatsBar />

      {/* ─── Features ─── */}
      <FeaturesSection />

      {/* ─── How It Works ─── */}
      <HowItWorksSection />

      {/* ─── AI Section ─── */}
      <AISection />

      {/* ─── Final CTA ─── */}
      <FinalCTA />

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════ */
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-bg-primary/70 backdrop-blur-xl border-b border-border/50"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center">
          <Target className="w-4 h-4 text-accent-primary" />
        </div>
        <span
          className="text-lg font-bold text-text-primary tracking-tight"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          FocusOS
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
        <a
          href="#features"
          className="hover:text-text-primary transition-colors"
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="hover:text-text-primary transition-colors"
        >
          How It Works
        </a>
        <a href="#ai" className="hover:text-text-primary transition-colors">
          AI Coaching
        </a>
      </div>
      <a
        href="/login"
        id="nav-cta"
        className="px-5 py-2 rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-sm font-medium hover:bg-accent-primary/20 hover:border-accent-primary/50 transition-all duration-300"
      >
        Sign In
      </a>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════
   DEVICE MOCKUP  –  PC + Phone side by side
   ═══════════════════════════════════════════════ */
function DeviceMockup() {
  return (
    <div className="relative flex items-end justify-center gap-6 md:gap-10">
      {/* PC Screen */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[640px]"
      >
        <div className="rounded-2xl border border-border bg-bg-secondary overflow-hidden shadow-[0_0_60px_rgba(108,99,255,0.08)]">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-elevated border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent-danger/70" />
              <span className="w-3 h-3 rounded-full bg-accent-warning/70" />
              <span className="w-3 h-3 rounded-full bg-accent-secondary/70" />
            </div>
            <span className="ml-3 text-xs text-text-tertiary font-mono">
              focusos.app/session/active
            </span>
          </div>
          {/* Session content */}
          <div className="p-6 space-y-5">
            {/* Timer row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">
                  Active Session
                </p>
                <p
                  className="text-lg font-semibold text-text-primary"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Build Auth Module
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p
                  className="text-3xl font-bold text-accent-primary"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  32:14
                </p>
                <p className="text-xs text-text-tertiary">remaining</p>
              </div>
            </div>

            {/* Task progress */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Tasks</span>
                <span className="text-accent-secondary text-xs font-medium">
                  2 / 3 done
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "66%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                />
              </div>
            </div>

            {/* Event log */}
            <div className="space-y-2">
              <p className="text-xs text-text-tertiary uppercase tracking-widest">
                Live Events
              </p>
              <EventRow
                icon={
                  <Eye className="w-3.5 h-3.5 text-accent-warning" />
                }
                label="Tab switch detected"
                time="2m ago"
                color="warning"
                delay={1}
              />
              <EventRow
                icon={
                  <Smartphone className="w-3.5 h-3.5 text-accent-phone" />
                }
                label="Phone picked up"
                time="5m ago"
                color="phone"
                delay={1.2}
              />
              <EventRow
                icon={
                  <Brain className="w-3.5 h-3.5 text-accent-primary" />
                }
                label="AI re-entry prompt shown"
                time="5m ago"
                color="primary"
                delay={1.4}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Phone */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:block relative w-[180px] md:w-[200px] flex-shrink-0"
      >
        <div className="rounded-[24px] border-2 border-border bg-bg-secondary overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.06)]">
          {/* Phone status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated">
            <span className="text-[10px] text-text-tertiary font-mono">
              9:41
            </span>
            <div className="w-16 h-4 rounded-full bg-bg-primary" />
            <span className="text-[10px] text-text-tertiary">●●●</span>
          </div>
          {/* Lock screen */}
          <div className="px-4 py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-secondary" />
            </div>
            <div>
              <p
                className="text-sm font-bold text-text-primary"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                🔒 Locked
              </p>
              <p className="text-[11px] text-text-secondary mt-1">
                Stay focused
              </p>
            </div>
            <p
              className="text-2xl font-bold text-accent-primary"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              32:14
            </p>
            <div className="w-full space-y-2 pt-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="w-full py-2 rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-[11px] text-accent-primary font-medium"
              >
                Using for work ✓
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="w-full py-2 rounded-lg border border-border text-[11px] text-text-secondary"
              >
                I need my phone
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connection line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="hidden md:block absolute top-1/2 left-[calc(50%+40px)] w-24 border-t border-dashed border-accent-primary/30"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="hidden md:flex absolute top-1/2 left-[calc(50%+90px)] -translate-y-1/2 w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/30 items-center justify-center"
      >
        <Zap className="w-3.5 h-3.5 text-accent-primary" />
      </motion.div>
    </div>
  );
}

function EventRow({
  icon,
  label,
  time,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  color: string;
  delay: number;
}) {
  const borderColor =
    color === "warning"
      ? "border-accent-warning/20"
      : color === "phone"
      ? "border-accent-phone/20"
      : "border-accent-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-elevated/50 border ${borderColor}`}
    >
      {icon}
      <span className="text-xs text-text-primary flex-1">{label}</span>
      <span className="text-[10px] text-text-tertiary">{time}</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { value: "40%", label: "average time lost to distractions", icon: Timer },
    { value: "2.3×", label: "faster re-entry with AI prompts", icon: Zap },
    { value: "87%", label: "users report deeper focus", icon: TrendingUp },
  ];

  return (
    <section className="relative border-y border-border bg-bg-secondary/40 py-10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            custom={i}
            className="flex items-center gap-4 justify-center"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
              <stat.icon className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p
                className="text-2xl font-bold text-text-primary"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary leading-tight">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════ */
function FeaturesSection() {
  const colorMap: Record<string, { hex: string; glow: string }> = {
    primary: { hex: "#6c63ff", glow: "rgba(108, 99, 255, 0.15)" },
    secondary: { hex: "#00d4aa", glow: "rgba(0, 212, 170, 0.15)" },
    phone: { hex: "#ffd700", glow: "rgba(255, 215, 0, 0.15)" },
  };

  const features = [
    {
      icon: Monitor,
      title: "PC Distraction Tracking",
      description:
        "Detects tab switches and idle time in real-time, automatically logging every interruption during your session.",
      colorKey: "primary",
    },
    {
      icon: Smartphone,
      title: "Phone Link via QR",
      description:
        "Scan a QR code to link your phone. Face-down detection and page visibility tracking run in the background.",
      colorKey: "phone",
    },
    {
      icon: Brain,
      title: "AI Re-entry Prompts",
      description:
        "When you return from a distraction, Gemini generates a context card telling you exactly where you left off.",
      colorKey: "secondary",
    },
    {
      icon: Activity,
      title: "Attention Score",
      description:
        "A composite 0–100 score based on focus time, task completion, distractions, and recovery speed.",
      colorKey: "primary",
    },
    {
      icon: BarChart3,
      title: "Pattern Analytics",
      description:
        "Discover your peak focus hours, biggest distractors, and how phone linking impacts your productivity.",
      colorKey: "secondary",
    },
    {
      icon: Sparkles,
      title: "AI Weekly Coaching",
      description:
        "Gemini analyzes your week and delivers actionable coaching insights to help you build better focus habits.",
      colorKey: "primary",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-accent-primary font-medium mb-3">
            Features
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-text-primary"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Everything you need to
            <br />
            <span className="text-accent-primary">reclaim your focus</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const c = colorMap[f.colorKey];
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                custom={i}
                className="group relative p-6 rounded-2xl bg-bg-secondary border border-border hover:border-border-glow transition-all duration-500"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: c.glow }}
                />
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: `${c.hex}15`,
                      borderWidth: 1,
                      borderColor: `${c.hex}40`,
                    }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: c.hex }} />
                  </div>
                  <h3
                    className="text-base font-bold text-text-primary mb-2"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Set up your session",
      description:
        "Name your task, add a checklist, choose your focus mode and duration. Scan the QR code with your phone.",
      icon: Target,
    },
    {
      step: "02",
      title: "Enter deep work",
      description:
        "Your timer runs. FocusOS silently tracks tab switches on PC and phone pickups in real-time.",
      icon: Shield,
    },
    {
      step: "03",
      title: "Get coached back",
      description:
        "When you get distracted, AI generates a re-entry prompt with exactly where you left off and what to do next.",
      icon: Brain,
    },
    {
      step: "04",
      title: "Review & improve",
      description:
        "Debrief your session, see your attention score, and discover patterns in your analytics dashboard.",
      icon: BarChart3,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 px-6 bg-bg-secondary/30 border-y border-border/50"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-accent-secondary font-medium mb-3">
            How It Works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-text-primary"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Four steps to
            <br />
            <span className="text-accent-secondary">effortless focus</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              custom={i}
              className="relative flex gap-5 p-6 rounded-2xl bg-bg-secondary border border-border group hover:border-border-glow transition-all duration-500"
            >
              <div className="flex-shrink-0">
                <span
                  className="text-3xl font-bold text-accent-primary/20 group-hover:text-accent-primary/40 transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.step}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-accent-primary" />
                  </div>
                  <h3
                    className="text-base font-bold text-text-primary"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {s.title}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   AI SECTION
   ═══════════════════════════════════════════════ */
function AISection() {
  return (
    <section id="ai" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-accent-primary font-medium mb-3">
              Gemini-Powered
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-text-primary mb-5"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Your AI
              <br />
              <span className="text-accent-primary">focus&nbsp;coach</span>
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              FocusOS doesn&apos;t just track — it understands. Gemini analyzes your
              session history to find patterns you can&apos;t see yourself: your
              peak focus hours, how phone pickups derail your flow, and which
              tasks drain your energy fastest.
            </p>
            <ul className="space-y-3">
              {[
                "Context-aware re-entry prompts after every distraction",
                "Weekly coaching insights based on session patterns",
                "Smart task suggestions based on energy levels",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-text-secondary"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-accent-secondary" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* AI Card mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-[0_0_60px_rgba(108,99,255,0.06)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center">
                  <Brain className="w-4.5 h-4.5 text-accent-primary" />
                </div>
                <div>
                  <p
                    className="text-sm font-bold text-text-primary"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    Re-entry Prompt
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    Generated by Gemini
                  </p>
                </div>
              </div>
              <div className="space-y-3 pl-4 border-l-2 border-accent-primary/30">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-text-primary"
                >
                  📌 You were building the authentication flow for the login
                  page.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-text-secondary"
                >
                  📍 You left off at the Google OAuth callback handler in{" "}
                  <code className="px-1.5 py-0.5 rounded bg-bg-elevated text-accent-primary text-xs font-mono">
                    auth.ts
                  </code>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                  className="text-sm text-accent-secondary font-medium"
                >
                  ⚡ Next: Add the session token to Firestore and redirect to
                  dashboard.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
                className="mt-5 p-3 rounded-xl bg-bg-elevated border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-phone" />
                  <p className="text-xs text-accent-phone font-medium">
                    Weekly Insight
                  </p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  &quot;You focus best between 9–11 AM. Phone pickups caused 60%
                  of your distractions this week. Try placing your phone in
                  another room during morning sessions.&quot;
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-3xl mx-auto text-center relative"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-accent-primary/[0.05] blur-[100px] pointer-events-none" />

        <div className="relative rounded-2xl border border-border bg-bg-secondary p-12 sm:p-16">
          <h2
            className="text-3xl sm:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Ready to
            <br />
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              understand your focus?
            </span>
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Start your first session in under 60 seconds. Free forever — no
            credit card required.
          </p>
          <a
            href="/login"
            id="footer-cta"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent-primary text-white font-semibold text-base shadow-[0_0_30px_rgba(108,99,255,0.35)] hover:shadow-[0_0_50px_rgba(108,99,255,0.5)] hover:brightness-110 transition-all duration-300"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center">
            <Target className="w-3 h-3 text-accent-primary" />
          </div>
          <span
            className="text-sm font-bold text-text-secondary"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            FocusOS
          </span>
        </div>
        <p className="text-xs text-text-tertiary">
          Built for ITM SummerHacks &apos;26 — PS3: Focus OS
        </p>
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <span>Powered by Gemini + Firebase</span>
        </div>
      </div>
    </footer>
  );
}
