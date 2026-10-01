"use client";

import { useState } from "react";
import { Link2, Copy, CheckCircle2, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [inviteUrl, setInviteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await fetch("/api/invite", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        // Construct full URL
        const fullUrl = `${window.location.origin}${data.url}`;
        setInviteUrl(fullUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-white relative">
      <Link href="/" className="absolute top-8 left-8 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
        <Home className="w-5 h-5 text-brand-300" />
      </Link>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 max-w-lg w-full shadow-2xl">
        <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-brand-500/30">
          <Link2 className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-center text-white mb-2">Admin Dashboard</h1>
        <p className="text-brand-300 text-center mb-8">Muhiddinxon uchun maxsus maxfiy havola (Invite link) yarating.</p>

        <button 
          onClick={generateInvite} 
          disabled={isLoading}
          className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 mb-6 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yangi Link Yaratish"}
        </button>

        {inviteUrl && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
            <span className="text-brand-200 truncate font-mono text-sm">{inviteUrl}</span>
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-brand-500/20 hover:bg-brand-500/40 text-brand-300 rounded-lg transition-colors flex-shrink-0"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
