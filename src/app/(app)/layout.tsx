"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Target, 
  ListTodo, 
  LayoutDashboard, 
  Settings,
  Zap,
  Minus,
  Square,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "setup", label: "New Session", icon: Zap, href: "/session/setup" },
];

import { GlobalTasksModal } from "@/components/GlobalTasksModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  // Keyboard shortcut: Ctrl+G to toggle Global Tasks modal (only on dashboard & setup)
  const isShortcutAllowed = pathname === "/dashboard" || pathname === "/session/setup";

  useEffect(() => {
    if (!isShortcutAllowed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        setIsTasksModalOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShortcutAllowed]);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* ── Sidebar ── */}
      {pathname !== "/session/active" && pathname !== "/dashboard" && pathname !== "/session/setup" && (
        <aside className="w-20 md:w-64 border-r border-border bg-bg-secondary flex flex-col items-center md:items-stretch py-6 px-4 shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-[0_0_20px_var(--focus-glow)]">
            <Target size={22} color="white" />
          </div>
          <span className="hidden md:block text-xl font-bold tracking-tighter text-text-primary" style={{ fontFamily: "var(--font-headline)" }}>
            FocusOS
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.id} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-bg-elevated border border-border-glow text-accent-primary" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-accent-primary" : "text-text-tertiary group-hover:text-text-secondary"} />
                  <span className="hidden md:block text-sm font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute left-0 w-1 h-6 bg-accent-primary rounded-r-full shadow-[0_0_10px_var(--focus-glow)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
          
          {/* Global Tasks Button Trigger */}
          <motion.button
            onClick={() => setIsTasksModalOpen(true)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 border border-transparent text-left w-full"
          >
            <ListTodo size={20} className="text-text-tertiary group-hover:text-text-secondary shrink-0" />
            <span className="hidden md:block text-sm font-semibold">Global Tasks</span>
          </motion.button>
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-bg-elevated/50 transition-all cursor-pointer"
          >
            <Settings size={20} />
            <span className="hidden md:block text-sm font-semibold">Settings</span>
          </motion.div>
        </div>
        </aside>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* ── Window Controls (top-right) — hidden during active sessions ── */}
        {pathname !== "/session/active" && (
        <div className="fixed top-0 right-0 z-50 flex items-center gap-0" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.electronAPI?.minimizeWindow) {
                window.electronAPI.minimizeWindow();
              }
            }}
            className="w-12 h-10 flex items-center justify-center text-text-tertiary hover:bg-white/[0.06] hover:text-text-primary transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.electronAPI?.maximizeWindow) {
                window.electronAPI.maximizeWindow();
              }
            }}
            className="w-12 h-10 flex items-center justify-center text-text-tertiary hover:bg-white/[0.06] hover:text-text-primary transition-colors cursor-pointer"
            title="Maximize"
          >
            <Square size={13} />
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.electronAPI?.closeWindow) {
                window.electronAPI.closeWindow();
              }
            }}
            className="w-12 h-10 flex items-center justify-center text-text-tertiary hover:bg-red-500/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>

      <GlobalTasksModal 
        isOpen={isTasksModalOpen} 
        onClose={() => setIsTasksModalOpen(false)} 
      />
    </div>
  );
}
