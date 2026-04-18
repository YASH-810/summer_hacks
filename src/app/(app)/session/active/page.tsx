"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Timer from "@/components/session/Timer";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Flag, AlertTriangle, CheckCircle2, Circle, Activity, MessageSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, get, set, query, limitToLast, onChildAdded } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { getSessionRTDB, updateSessionRTDB } from "@/lib/firestore/sessions";
import { logPCEventRTDB } from "@/lib/firestore/events";
import { Session, Task } from "@/types";

function ActiveSessionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Notification banner state
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string } | null>(null);

  const lastSyncTs = useRef<string>("");
  const timeInitialized = useRef<boolean>(false);

  const addLog = (type: "distraction" | "success" | "system", message: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setLogs(prev => [{ id: Date.now() + Math.random(), time, message, type }, ...prev].slice(0, 15));
  };

  // 1. Initial Load & Real-time Sync
  useEffect(() => {
    if (!user || !sessionId) return;
    
    // First try user-scoped session path
    const scopedRef = ref(rtdb, `users/${user.uid}/sessions/${sessionId}`);
    // Fallback un-scoped legacy path
    const legacyRef = ref(rtdb, `sessions/${sessionId}`);
    
    const unsubscribe = onValue(scopedRef, async (snapshot) => {
      let data = snapshot.val();
      
      // If it doesn't exist at the new scoped path, check the legacy path
      if (!snapshot.exists()) {
        const legacySnap = await get(legacyRef);
        if (legacySnap.exists()) {
           data = legacySnap.val();
        } else {
           return; // Session truly not found
        }
      }

      setSessionData(data as Session);
      
      if (!timeInitialized.current && data.plannedDuration) {
        setRemaining(data.plannedDuration * 60);
        timeInitialized.current = true;
      }
      
      let sTasks = data.sessionTasks || data.tasks || [];
      if (!Array.isArray(sTasks)) {
        sTasks = Object.values(sTasks);
      }
      setTasks(sTasks);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  // Add initial log
  useEffect(() => {
    if (sessionId) {
      addLog("system", "Session activated securely");
    }
  }, [sessionId]);



  // 3. Phone Real-Time Sync (Android Companion App)
  useEffect(() => {
    if (!user || !sessionId) return;
    
    // Listen directly to the new session notifications path provided by the scanner
    const notificationsRef = ref(rtdb, `users/${user.uid}/sessions/${sessionId}/notification`);
    const recentQuery = query(notificationsRef, limitToLast(1));
    
    const unsub = onChildAdded(recentQuery, (snapshot) => {
      if (snapshot.exists()) {
        const ev = snapshot.val();
        
        // Prevent duplicate processing on reloads
        if (ev.timestamp && ev.timestamp === lastSyncTs.current) return;
        if (ev.timestamp) lastSyncTs.current = ev.timestamp;
        
        if (ev.type === "pickup") {
          addLog("distraction", "Phone picked up");
        } else if (ev.type === "putdown") {
          addLog("success", "Phone placed face-down");
        } else if (ev.type === "intent_logged") {
          addLog("system", `Recorded phone use: ${ev.intent}`);
        } else if (ev.type === "important_notification") {
          setActiveNotification({ title: "Important Notification", message: ev.message });
          addLog("system", `Message from: ${ev.message}`);
          setTimeout(() => setActiveNotification(null), 5000);
        } else {
          // Native Android Notification handler fallback
          const title = ev.title || ev.packageName || "Phone Alert";
          const text = ev.text || ev.message || "New activity detected";
          
          setActiveNotification({ title, message: text });
          addLog("distraction", `Intercepted: ${title} - ${text}`);
          setTimeout(() => setActiveNotification(null), 5000);
        }
      }
    });

    return () => unsub();
  }, [user, sessionId]);

  // 4. Timer Logic
  useEffect(() => {
    if (isPaused || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, remaining]);

  const toggleTask = async (id: string) => {
    if (!user || !sessionId) return;
    const newTasks = tasks.map((t: any) => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(newTasks);
    // Persist to RTDB
    await updateSessionRTDB(user.uid, sessionId, { sessionTasks: newTasks } as any);
  };

  const endSession = async () => {
    if (!user || !sessionId) return;

    try {
      // 1. Return unfinished tasks to global backlog
      const unfinishedTasks = tasks.filter(t => !t.done);
      if (unfinishedTasks.length > 0) {
        const globalTasksRef = ref(rtdb, `users/${user.uid}/tasks`);
        const snapshot = await get(globalTasksRef);
        let currentGlobalTasks: Task[] = [];
        if (snapshot.exists()) {
          currentGlobalTasks = snapshot.val() as Task[];
        }
        
        // Append unfinished tasks
        const updatedGlobalTasks = [...unfinishedTasks, ...currentGlobalTasks];
        await set(globalTasksRef, updatedGlobalTasks);
      }

      // 2. Delete the session completely from RTDB
      const sessionRef = ref(rtdb, `users/${user.uid}/sessions/${sessionId}`);
      await set(sessionRef, null);

      // Redirect to session/active as requested
      router.push(`/session/active`);
    } catch (error) {
      console.error("Error ending session:", error);
      // Fallback redirect
      router.push(`/session/active`);
    }
  };

  const simulateNotification = () => {
    setActiveNotification({ title: "Important Notification", message: "Mom: Are you coming home for dinner?" });
    addLog("system", `Intercepted: Mom: Are you coming home for dinner?`);
    
    setTimeout(() => {
      setActiveNotification(null);
    }, 5000);
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-secondary/[0.05] blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md relative z-10 space-y-6"
        >
          <div className="w-24 h-24 bg-accent-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,212,170,0.15)] border border-accent-secondary/20">
            <Flag className="w-10 h-10 text-accent-secondary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Session Ended</h1>
          <p className="text-text-secondary pb-4 leading-relaxed">
            Your focus session has been completely cleared and any remaining tasks were securely returned to your global backlog.
          </p>
          <button 
            onClick={() => router.push('/session/setup')}
            className="px-8 py-3.5 rounded-xl bg-accent-primary text-white font-bold tracking-wide hover:brightness-110 shadow-[0_0_20px_rgba(108,99,255,0.25)] transition-all cursor-pointer"
          >
            Start New Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 relative z-10 hidden-scrollbar overflow-x-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* --- NOTIFICATION BANNER --- */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 30, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="absolute top-0 left-1/2 z-50 flex items-center gap-4 bg-bg-elevated border border-accent-primary shadow-[0_10px_40px_rgba(108,99,255,0.3)] px-6 py-4 rounded-2xl min-w-[320px]"
          >
            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-0.5">{activeNotification.title}</p>
              <p className="text-sm font-medium text-text-primary">{activeNotification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: Live Event Log */}
      <div className="hidden lg:flex flex-col gap-6 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-secondary tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-headline)" }}>Live Event Log</h2>
          <Activity className="w-4 h-4 text-text-tertiary" />
        </div>
        <div className="h-[1px] w-full bg-border border-b border-border/50 shrink-0 mb-2" />

        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {logs.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
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
          {logs.length === 0 && (
            <div className="text-sm text-text-tertiary text-center mt-6">Awaiting events...</div>
          )}
        </div>
      </div>

      {/* CENTER: Timer & Controls */}
      <div className="flex flex-col items-center justify-center pt-8 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center flex flex-col gap-3"
        >
          {sessionData?.title ? (
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">{sessionData.title}</h1>
          ) : (
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">Focus Session</h1>
          )}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(108,99,255,0.15)] uppercase">
              <span className={`w-2 h-2 rounded-full bg-accent-primary ${!isPaused ? 'animate-pulse' : 'opacity-50'}`} />
              {sessionData?.focusMode || "STRICT"} MODE ACTIVE
            </span>
          </div>
        </motion.div>

        <motion.div
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Timer
            totalSeconds={sessionData?.plannedDuration ? sessionData.plannedDuration * 60 : 25 * 60}
            remainingSeconds={remaining}
            isPaused={isPaused}
          />
        </motion.div>
      </div>

      {/* RIGHT: Task Checklist */}
      <div className="hidden lg:flex flex-col gap-6 pt-10">
        <div>
          <h2 className="text-sm font-bold text-text-secondary tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-headline)" }}>Current Objectives</h2>
          <div className="h-[1px] w-full bg-border border-b border-border/50 mt-3 mb-4 shrink-0" />
        </div>
        
        <div className="flex flex-col gap-3">
          {tasks.map((task: any) => (
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
          {tasks.length === 0 && (
            <div className="text-sm text-text-tertiary text-center mt-6">No tasks defined</div>
          )}
        </div>
      </div>

      {/* BOTTOM BAR: Fixed Controls */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-bg-secondary/70 backdrop-blur-2xl border-t border-border flex items-center justify-center gap-4 sm:gap-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={simulateNotification}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-accent-secondary/50 text-accent-secondary hover:bg-accent-secondary/10 hover:border-accent-secondary transition-colors font-medium text-sm cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Simulate Text</span>
          <span className="sm:hidden">Test</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-accent-warning/50 text-accent-warning hover:bg-accent-warning/10 hover:border-accent-warning transition-colors font-medium text-sm cursor-pointer"
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

// Wrap inside Suspense to handle Next.js 15 useSearchParams requirement
export default function ActiveSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <ActiveSessionInner />
    </Suspense>
  );
}
