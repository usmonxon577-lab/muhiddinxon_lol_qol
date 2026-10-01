"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [step, setStep] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Check if intro was already seen in this session
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      onComplete();
      return;
    }

    const timer1 = setTimeout(() => setStep(1), 0); // "Ancha bo'ldi..."
    const timer2 = setTimeout(() => setStep(2), 2000); // "Endi bir kunni tanlaymiz..."
    const timer3 = setTimeout(() => setStep(3), 4000); // "Muhiddinxon, tayyormisan?"
    const timer4 = setTimeout(() => {
      finishIntro();
    }, 6000); // End

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const finishIntro = () => {
    if (!isSkipped) {
      setIsSkipped(true);
      sessionStorage.setItem("hasSeenIntro", "true");
      onComplete();
    }
  };

  if (isSkipped) return null;

  // Reduced motion variants
  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, filter: "blur(10px)", scale: 0.95, y: 10 },
        animate: { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 },
        exit: { opacity: 0, filter: "blur(10px)", scale: 1.05, y: -10 },
      };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900 overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.h1
            key="text1"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl md:text-5xl lg:text-6xl font-medium text-white text-center px-6 leading-relaxed"
          >
            Ancha bo'ldi ko'rishmaganimiz...
          </motion.h1>
        )}
        {step === 2 && (
          <motion.h1
            key="text2"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl md:text-5xl lg:text-6xl font-medium text-brand-200 text-center px-6 leading-relaxed"
          >
            Endi bir kunni tanlaymiz. 🤝
          </motion.h1>
        )}
        {step === 3 && (
          <motion.h1
            key="text3"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300 text-center px-6 leading-tight"
          >
            Muhiddinxon, tayyormisan?
          </motion.h1>
        )}
      </AnimatePresence>

      <button
        onClick={finishIntro}
        className="absolute bottom-10 right-10 text-brand-300 hover:text-white transition-colors text-sm font-medium tracking-widest uppercase opacity-70 hover:opacity-100 z-50"
      >
        Skip Intro
      </button>

      {/* Decorative ambient background for intro */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>
    </motion.div>
  );
}
