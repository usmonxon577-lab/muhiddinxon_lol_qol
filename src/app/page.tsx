"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import BookingInterface from "@/components/BookingInterface";
import IntroSequence from "@/components/IntroSequence";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  // Initial check to prevent flash of main content if intro should be skipped
  useEffect(() => {
    if (sessionStorage.getItem("hasSeenIntro")) {
      setShowIntro(false);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroSequence key="intro" onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showIntro && (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // smooth cinematic ease
            className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8"
          >
            {/* Background ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 opacity-40 pointer-events-none" />
            
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center z-10 my-auto py-12">
              
              {/* Left Column - Hero Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-medium tracking-wide text-brand-100">Exclusive Invitation</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                  Let's catch up, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">
                    Muhiddinxon.
                  </span>
                </h1>
                
                <p className="text-lg text-brand-200/80 max-w-md leading-relaxed">
                  It's been a while since we last met. Choose a time that works best for you, and let's grab a coffee or just hang out.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 mt-4">
                  <div className="flex items-center gap-3 text-brand-300/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Flexible Dates</span>
                  </div>
                  <div className="flex items-center gap-3 text-brand-300/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Tashkent, UZ</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Booking Interface */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Decorative elements behind the card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/30 to-indigo-500/30 rounded-3xl blur-xl opacity-50 -z-10" />
                
                <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <BookingInterface />
                </div>
              </motion.div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
