"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, GripVertical, Download, ArrowRight } from "lucide-react";
import type { Task } from "@/types";

interface ImportTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalTasks: Task[];
  onImport: (tasksToImport: Task[]) => void;
}

export function ImportTasksModal({ isOpen, onClose, globalTasks, onImport }: ImportTasksModalProps) {
  const [backlog, setBacklog] = useState<Task[]>([]);
  const [staged, setStaged] = useState<Task[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBacklog(globalTasks.filter(t => !t.done));
      setStaged([]);
    }
  }, [isOpen, globalTasks]);

  if (!isOpen) return null;

  /* ── Drag & Drop Handlers ── */
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetList: "backlog" | "staged") => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id || id === draggedTaskId === false) return; // Basic validation
    
    // Locate the task
    const taskInBacklog = backlog.find((t) => t.id === id);
    const taskInStaged = staged.find((t) => t.id === id);
    
    // Move logic
    if (targetList === "staged" && taskInBacklog) {
      setBacklog((prev) => prev.filter((t) => t.id !== id));
      setStaged((prev) => [...prev, taskInBacklog]);
    } else if (targetList === "backlog" && taskInStaged) {
      setStaged((prev) => prev.filter((t) => t.id !== id));
      setBacklog((prev) => [...prev, taskInStaged]);
    }

    setDraggedTaskId(null);
  };

  const handleConfirm = () => {
    onImport(staged);
    onClose();
  };

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
        className="relative w-full max-w-4xl bg-bg-secondary border border-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30">
              <Download className="text-accent-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-headline)" }}>
                Import Active Tasks
              </h2>
              <p className="text-xs text-text-secondary">Drag tasks from your backlog into the session staging area.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-elevated border border-border text-text-tertiary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drag and Drop Grid */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          
          {/* Left Column: Backlog */}
          <div 
            className="flex-1 flex flex-col border-r border-border bg-bg-primary/30 p-6 overscroll-contain overflow-y-auto"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "backlog")}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary" style={{ fontFamily: "var(--font-headline)" }}>
                Global Backlog
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-bg-elevated border border-border text-text-secondary">
                {backlog.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3 min-h-[150px]">
              <AnimatePresence>
                {backlog.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: draggedTaskId === task.id ? 0.5 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3 bg-bg-secondary border border-border p-3 rounded-xl cursor-grab active:cursor-grabbing hover:border-accent-primary/50 transition-colors shadow-sm"
                  >
                    <GripVertical size={16} className="text-text-tertiary shrink-0" />
                    <span className="text-sm text-text-primary flex-1 truncate">{task.text}</span>
                  </motion.div>
                ))}
                {backlog.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-tertiary py-10 opacity-60">
                    <CheckCircle2 size={32} className="mb-2" />
                    <p className="text-sm">Backlog is empty</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center -mx-4 z-10 w-8">
            <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center shadow-lg">
              <ArrowRight size={14} className="text-text-tertiary" />
            </div>
          </div>

          {/* Right Column: Staging */}
          <div 
            className="flex-1 flex flex-col bg-bg-primary/30 p-6 overscroll-contain overflow-y-auto"
            style={{ 
              backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundColor: 'rgba(108, 99, 255, 0.02)'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "staged")}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent-primary" style={{ fontFamily: "var(--font-headline)" }}>
                Session Tasks
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-accent-primary/20 border border-accent-primary text-accent-primary">
                {staged.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[150px] border-2 border-dashed border-border rounded-2xl p-4 flex-1">
              <AnimatePresence>
                {staged.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: draggedTaskId === task.id ? 0.5 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3 bg-bg-elevated border border-accent-primary p-3 rounded-xl cursor-grab active:cursor-grabbing shadow-[0_0_15px_var(--focus-glow)]"
                  >
                    <GripVertical size={16} className="text-accent-primary shrink-0" />
                    <span className="text-sm text-text-primary flex-1 truncate">{task.text}</span>
                  </motion.div>
                ))}
                {staged.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-tertiary">
                    <p className="text-sm">Drag tasks here</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between bg-bg-secondary w-full">
          <p className="text-xs text-text-secondary">
            Imported tasks will be removed from your backlog once the session begins.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-border bg-bg-elevated text-text-secondary font-semibold hover:text-text-primary transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={staged.length === 0}
              className="px-6 py-2.5 rounded-xl border border-transparent bg-accent-primary text-white font-semibold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_20px_var(--focus-glow)] cursor-pointer"
            >
              Import {staged.length} Task{staged.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
