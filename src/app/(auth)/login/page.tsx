"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfile } from "../../../lib/firestore/users";

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (e) {
      console.error("Login failed", e);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10 overflow-x-hidden items-center justify-center p-6">
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-primary/[0.05] blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-bg-secondary border border-border shadow-[0_0_60px_rgba(108,99,255,0.06)]"
      >
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
            <Target className="w-7 h-7 text-accent-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-text-primary mb-2" style={{ fontFamily: "var(--font-headline)" }}>
          Sign in to FocusOS
        </h1>
        <p className="text-sm text-text-secondary text-center mb-10">
          Sync your sessions across PC and phone.
        </p>
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn || loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-bg-elevated border border-border hover:border-accent-primary/60 hover:bg-accent-primary/10 transition-all text-sm font-medium text-text-primary disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
          )}
          {isLoggingIn ? "Signing you in..." : "Continue with Google"}
        </button>
      </motion.div>
    </div>
  );
}
