"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import type { Task } from "@/types";

export function useFirebaseTasks(uid?: string | null) {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTasksState([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksRef = ref(rtdb, `users/${uid}/tasks`);
    
    // Subscribe to realtime updates
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        // Firebase drops empty arrays, ensure we fall back gracefully
        setTasksState(snapshot.val() as Task[]);
      } else {
        setTasksState([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [uid]);

  // Wrapper to update Firebase when setTasks is called
  const setTasks = async (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    if (!uid) return;

    try {
      const updatedTasks = typeof newTasks === "function" ? newTasks(tasks) : newTasks;
      
      // Update local state immediately for snappy UI (optimistic update)
      setTasksState(updatedTasks);
      
      // Sync to Firebase Realtime Database
      const tasksRef = ref(rtdb, `users/${uid}/tasks`);
      await set(tasksRef, updatedTasks);
    } catch (error) {
      console.error("Failed to sync tasks to Firebase:", error);
    }
  };

  const removeTasks = async (taskIds: string[]) => {
    if (!uid) return;
    const remainingTasks = tasks.filter(t => !taskIds.includes(t.id));
    await setTasks(remainingTasks);
  };

  return { tasks, setTasks, removeTasks, loading } as const;
}
