"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [targetUser, setTargetUser] = useState("");
  const [error, setError] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();
        
        if (res.ok && data.valid) {
          setIsValid(true);
          setTargetUser(data.targetUser);
        } else {
          setError(data.error || "Ushbu havola yaroqsiz yoki allaqachon ishlatilgan.");
        }
      } catch(e) {
        setError("Tarmoq xatoligi yuz berdi. Iltimos qayta urinib ko'ring.");
      } finally {
        setIsValidating(false);
      }
    };
    validate();
  }, [token]);

  const handleStart = async () => {
    setIsAccepting(true);
    try {
      // Mark as used
      await fetch(`/api/invite/${token}`, { method: 'PATCH' });
      
      // Set local storage so the main app knows who is using it
      localStorage.setItem("currentUser", targetUser);
      localStorage.setItem("hasSeenIntro", "true"); // Skip intro for seamless entry
      
      // Navigate to app
      router.push("/");
    } catch(e) {
      console.error(e);
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {isValidating ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-brand-400 animate-spin mb-4" />
            <p className="text-brand-300 font-medium">Maxfiy havola tekshirilmoqda...</p>
          </motion.div>
        ) : !isValid ? (
          <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl border border-red-500/30 max-w-md w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Xatolik</h2>
            <p className="text-brand-200">{error}</p>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col items-center max-w-lg w-full text-center">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-semibold tracking-widest uppercase mb-6">
                Maxsus Taklifnoma
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-200 tracking-tighter mb-4">
                Salom, {targetUser} 👋
              </h1>
              <p className="text-xl sm:text-2xl text-brand-200/80 font-medium leading-relaxed">
                Usmonxon siz bilan uchrashuv rejalashtirmoqda.
              </p>
            </motion.div>

            <motion.button 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
              onClick={handleStart}
              disabled={isAccepting}
              className="group relative w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold text-lg py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_rgba(81,123,178,0.4)] hover:shadow-[0_0_60px_rgba(81,123,178,0.6)] disabled:opacity-50"
            >
              {isAccepting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  BOSHLASH <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
