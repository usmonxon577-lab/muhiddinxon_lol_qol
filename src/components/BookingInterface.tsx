"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon, Loader2, User, Plus, MapPin, Edit3, Heart, Coffee, Gamepad2, Users, Image as ImageIcon, Sparkles } from "lucide-react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameDay, isToday, 
  isBefore, startOfToday, getDay
} from "date-fns";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

const QUICK_TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MOODS = ["😎", "😂", "🔥", "😴", "🤩"];

const LOCATIONS = [
  { id: "coffee", label: "Coffee", icon: "☕" },
  { id: "park", label: "Park", icon: "🌳" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "cinema", label: "Cinema", icon: "🎬" },
  { id: "restaurant", label: "Restaurant", icon: "🍔" },
  { id: "walk", label: "Walk", icon: "🚶" },
  { id: "custom", label: "Custom location", icon: "📍" },
];

const ACTIVITIES = [
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "coffee", label: "Coffee", icon: "☕" },
  { id: "movie", label: "Movie", icon: "🎬" },
  { id: "food", label: "Food", icon: "🍔" },
  { id: "walk", label: "Walk", icon: "🚶" },
  { id: "photos", label: "Photos", icon: "📸" },
  { id: "talk", label: "Just talk", icon: "💬" },
];

export default function BookingInterface() {
  const today = startOfToday();
  const [step, setStep] = useState(1); 
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Profile & Availabilities
  const [activeProfile, setActiveProfile] = useState<'Usmonxon' | 'Muhiddinxon' | null>(null);
  const [usmonxonData, setUsmonxonData] = useState<{times: string[], mood: string|null, vote: string|null}>({times: [], mood: null, vote: null});
  const [muhiddinxonData, setMuhiddinxonData] = useState<{times: string[], mood: string|null, vote: string|null}>({times: [], mood: null, vote: null});
  
  const [customTime, setCustomTime] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
  // Final Booking state
  const [finalMatchedTime, setFinalMatchedTime] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingLocation, setBookingLocation] = useState<string | null>(null);
  const [bookingActivity, setBookingActivity] = useState<string | null>(null);
  
  // Location & Activity State
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [activity, setActivity] = useState("");
  const [isRandomizing, setIsRandomizing] = useState(false);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown & Stats state
  const [targetDateISO, setTargetDateISO] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [stats, setStats] = useState({ meetings: 0, coffees: 0, gaming: 0, memories: 0 });

  // Arrival states
  const [usmonxonArrived, setUsmonxonArrived] = useState(false);
  const [muhiddinxonArrived, setMuhiddinxonArrived] = useState(false);
  const [isArrivalLoading, setIsArrivalLoading] = useState(false);

  // Memory Upload state
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [memoryNotes, setMemoryNotes] = useState("");
  const [memoryFiles, setMemoryFiles] = useState<File[]>([]);
  const [isMemorySubmitting, setIsMemorySubmitting] = useState(false);
  const [memorySuccess, setMemorySuccess] = useState(false);

  useEffect(() => {
    const savedTarget = localStorage.getItem("meetingTargetDate");
    const savedBookingId = localStorage.getItem("meetingBookingId");
    
    if (savedTarget && savedBookingId) {
      setTargetDateISO(savedTarget);
      setBookingId(savedBookingId);
      setStep(6);
      fetchStats();
      fetchBookingDetails(savedBookingId);
    }
    
    const user = localStorage.getItem("currentUser");
    if (user === 'Usmonxon' || user === 'Muhiddinxon') {
      setActiveProfile(user);
    }
  }, []);

  const fetchBookingDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUsmonxonArrived(data.booking.usmonxonArrived);
        setMuhiddinxonArrived(data.booking.muhiddinxonArrived);
        
        let loc = data.booking.location;
        if (loc === 'custom') loc = data.booking.customLocation;
        else {
          const found = LOCATIONS.find(l => l.id === loc);
          if (found) loc = `${found.icon} ${found.label}`;
        }
        setBookingLocation(loc);
        setBookingActivity(data.booking.activity);
      }
    } catch(e) { console.error(e); }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch(e) { console.error(e); }
  };

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleRandomActivity = () => {
    setIsRandomizing(true);
    let count = 0;
    const maxJumps = 20;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * ACTIVITIES.length);
      setActivity(ACTIVITIES[randomIdx].id);
      count++;
      if (count > maxJumps) {
        clearInterval(interval);
        setIsRandomizing(false);
        triggerConfetti();
      }
    }, 100);
  };

  useEffect(() => {
    if (step !== 6 || !targetDateISO) return;
    
    const isMeetingDay = isToday(new Date(targetDateISO));
    if (isMeetingDay) return; // don't need countdown if it's today

    const calculateTimeLeft = () => {
      const target = new Date(targetDateISO).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [step, targetDateISO]);

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const emptyDays = Array.from({ length: firstDayOfMonth });

  const triggerConfetti = () => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#517bb2', '#ffffff', '#a4bcda', '#ff3366'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#517bb2', '#ffffff', '#a4bcda', '#ff3366'] });
    }, 250);
  };

  const triggerMegaConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 100 };
    
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 100 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'] });
    }, 250);
  }

  const handleDateSelect = (day: Date) => {
    if (isBefore(day, today)) return;
    setSelectedDate(day);
    setStep(1.5);
    triggerConfetti();
    fetchAvailabilities(day);
    setTimeout(() => setStep(2), 3000);
  };

  const fetchAvailabilities = async (date: Date) => {
    setIsLoadingAvailability(true);
    try {
      const dateString = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/availability?date=${dateString}`);
      if (res.ok) {
        const data = await res.json();
        setUsmonxonData(data.Usmonxon || {times:[], mood:null, vote:null});
        setMuhiddinxonData(data.Muhiddinxon || {times:[], mood:null, vote:null});
      }
    } catch (e) { console.error(e); } 
    finally { setIsLoadingAvailability(false); }
  };

  const updateProfileData = async (field: 'times' | 'mood' | 'vote', value: any) => {
    if (!activeProfile || !selectedDate) return;
    
    let currentData = activeProfile === 'Usmonxon' ? {...usmonxonData} : {...muhiddinxonData};
    
    if (field === 'times') {
      const timeStr = value as string;
      currentData.times = currentData.times.includes(timeStr) ? currentData.times.filter(t => t !== timeStr) : [...currentData.times, timeStr];
    } else if (field === 'mood') {
      currentData.mood = value;
    } else if (field === 'vote') {
      currentData.vote = value;
    }

    if (activeProfile === 'Usmonxon') setUsmonxonData(currentData);
    else setMuhiddinxonData(currentData);

    const dateString = format(selectedDate, "yyyy-MM-dd");
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateString, user: activeProfile, ...currentData }),
    });
  };

  const handleSubmitFinal = async () => {
    if (!selectedDate || !finalMatchedTime) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: selectedDate, time: finalMatchedTime, location,
          customLocation: location === 'custom' ? customLocation : undefined,
          activity, message 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const createdId = data.booking._id;
        
        const [hours, minutes] = finalMatchedTime.split(":");
        const target = new Date(selectedDate);
        target.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        const iso = target.toISOString();
        
        localStorage.setItem("meetingTargetDate", iso);
        localStorage.setItem("meetingBookingId", createdId);
        
        setTargetDateISO(iso);
        setBookingId(createdId);
        
        let loc = data.booking.location;
        if (loc === 'custom') loc = data.booking.customLocation;
        else {
          const found = LOCATIONS.find(l => l.id === loc);
          if (found) loc = `${found.icon} ${found.label}`;
        }
        setBookingLocation(loc);

        setStep(5);
        triggerConfetti();
        fetchStats();
        setTimeout(() => setStep(6), 3500);
      }
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const handleArrival = async (user: 'Usmonxon' | 'Muhiddinxon') => {
    if (!bookingId || isArrivalLoading) return;
    setIsArrivalLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user })
      });
      if (res.ok) {
        const data = await res.json();
        setUsmonxonArrived(data.booking.usmonxonArrived);
        setMuhiddinxonArrived(data.booking.muhiddinxonArrived);
        
        if (data.booking.usmonxonArrived && data.booking.muhiddinxonArrived) {
          triggerMegaConfetti();
        } else {
          triggerConfetti();
        }
      }
    } catch(e) { console.error(e) }
    finally { setIsArrivalLoading(false); }
  }

  const handleBack = () => {
    if (step === 2) { setActiveProfile(null); setStep(1); }
    if (step === 3) setStep(2);
    if (step === 4) setStep(3);
  };

  const matchingTimes = usmonxonData.times.filter(time => muhiddinxonData.times.includes(time));
  const hasNoMatchesButBothFilled = usmonxonData.times.length > 0 && muhiddinxonData.times.length > 0 && matchingTimes.length === 0;
  
  const activeProfileData = activeProfile === 'Usmonxon' ? usmonxonData : activeProfile === 'Muhiddinxon' ? muhiddinxonData : {times:[], mood:null, vote:null};
  const allDisplayTimes = Array.from(new Set([...QUICK_TIMES, ...activeProfileData.times])).sort();

  const bothVotedSame = usmonxonData.vote && muhiddinxonData.vote && usmonxonData.vote === muhiddinxonData.vote;
  
  useEffect(() => {
    if (step === 3 && bothVotedSame && !activity) {
      setActivity(usmonxonData.vote!);
    }
  }, [step, bothVotedSame]);

  const handleMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !targetDateISO || !bookingLocation || !bookingActivity) return;
    setIsMemorySubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("date", targetDateISO);
      formData.append("location", bookingLocation);
      formData.append("activity", bookingActivity);
      formData.append("notes", memoryNotes);
      memoryFiles.forEach(file => formData.append("photos", file));

      const res = await fetch("/api/memories", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMemorySuccess(true);
        triggerConfetti();
        fetchStats(); // Update stats
      }
    } catch(err) { console.error(err); }
    finally { setIsMemorySubmitting(false); }
  }

  const isMeetingDay = targetDateISO ? isToday(new Date(targetDateISO)) : false;
  const bothArrived = usmonxonArrived && muhiddinxonArrived;

  return (
    <div className="w-full flex flex-col min-h-[550px] max-h-[80vh] overflow-y-auto scrollbar-hide">
      {step !== 1.5 && step !== 5 && step !== 6 && (
        <div className="flex items-center justify-between mb-8 z-10 relative">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={handleBack} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-brand-200"><ChevronLeft className="w-5 h-5" /></button>
            )}
            <h2 className="text-xl font-semibold text-white">
              {step === 1 ? "Sana tanlang" : step === 2 ? "Vaqt & Rejalar" : step === 3 ? "Joy va Reja" : "Meeting Plan"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full transition-colors", step >= 1 ? "bg-brand-400" : "bg-white/10")} />
            <div className={cn("w-2 h-2 rounded-full transition-colors", step >= 2 ? "bg-brand-400" : "bg-white/10")} />
            <div className={cn("w-2 h-2 rounded-full transition-colors", step >= 3 ? "bg-brand-400" : "bg-white/10")} />
            <div className={cn("w-2 h-2 rounded-full transition-colors", step >= 4 ? "bg-brand-400" : "bg-white/10")} />
          </div>
        </div>
      )}

      <div className="flex-1 relative pb-4">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CALENDAR */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} transition={{ duration: 0.4 }} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-lg font-medium text-white">{format(currentMonth, "MMMM yyyy")}</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-brand-200 hover:bg-white/10 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white/5 border border-white/10 text-brand-200 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {DAYS_OF_WEEK.map((d) => (<span key={d} className="text-xs font-semibold text-brand-300/60 tracking-wider">{d}</span>))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, idx) => (<div key={`empty-${idx}`} className="h-10 sm:h-12" />))}
                {daysInMonth.map((day, idx) => {
                  const isPast = isBefore(day, today);
                  const isSelectedDay = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isTodayDate = isToday(day);
                  return (
                    <button
                      key={idx} onClick={() => handleDateSelect(day)} disabled={isPast}
                      className={cn("relative h-10 sm:h-12 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300", isPast ? "text-white/20 cursor-not-allowed" : "cursor-pointer hover:bg-white/10 text-brand-100", isTodayDate && !isSelectedDay && "border border-brand-500/50 text-brand-300", isSelectedDay && "bg-brand-500 text-white shadow-lg border border-brand-400")}
                    >
                      {isSelectedDay && <motion.div layoutId="selectedDay" className="absolute inset-0 bg-brand-400/30 rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                      <span className="relative z-10">{format(day, "d")}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 1.5: DATE SUCCESS EXPERIENCE */}
          {step === 1.5 && (
            <motion.div key="step1.5" initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-xl bg-dark-900/60 rounded-3xl">
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-center p-6">
                <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mb-6 mx-auto relative shadow-[0_0_40px_rgba(81,123,178,0.5)]">
                  <div className="absolute inset-0 bg-brand-400/20 rounded-full animate-ping" />
                  <CalendarIcon className="w-10 h-10 text-brand-400 relative z-10" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white mb-4 uppercase tracking-tight">OOO! ZO'R KUN TANLANDI! 🎉</h3>
                <p className="text-lg text-brand-200 font-medium">{selectedDate && format(selectedDate, "d MMMM, yyyy")}</p>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: TIME, MOOD & DECISION */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col h-full">
              {isLoadingAvailability ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {!activeProfile ? (
                    <div className="flex-1">
                      <p className="text-brand-200 mb-6 text-center">Siz kimsiz? Bo'sh vaqtlaringizni belgilash uchun o'z profilingizni tanlang.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setActiveProfile('Usmonxon')} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center"><User className="w-8 h-8 text-brand-400" /></div>
                          <span className="font-semibold text-white">Usmonxon</span>
                          <span className="text-xs text-brand-300">{usmonxonData.times.length > 0 ? `${usmonxonData.times.length} ta vaqt` : "Hali belgilanmagan"}</span>
                        </button>
                        <button onClick={() => setActiveProfile('Muhiddinxon')} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center"><User className="w-8 h-8 text-indigo-400" /></div>
                          <span className="font-semibold text-white">Muhiddinxon</span>
                          <span className="text-xs text-brand-300">{muhiddinxonData.times.length > 0 ? `${muhiddinxonData.times.length} ta vaqt` : "Hali belgilanmagan"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-brand-300/80 flex items-center gap-2"><User className="w-4 h-4" /> Siz: <strong className="text-white">{activeProfile}</strong></p>
                        <button onClick={() => setActiveProfile(null)} className="text-xs text-brand-400 hover:underline">Profilni o'zgartirish</button>
                      </div>

                      {/* QUICK MOOD */}
                      <div className="mb-6">
                        <p className="text-sm font-medium text-white mb-2">Bugungi kayfiyat?</p>
                        <div className="flex gap-2">
                          {MOODS.map(m => (
                            <button key={m} onClick={() => updateProfileData('mood', m)} className={cn("text-2xl p-2 rounded-xl transition-transform hover:scale-110", activeProfileData.mood === m ? "bg-brand-500/30 scale-110 border border-brand-400/50" : "bg-white/5 border border-white/10")}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* MINI DECISION: COFFEE OR GAMING */}
                      <div className="mb-6">
                        <p className="text-sm font-medium text-white mb-2">Coffee yoki Gaming?</p>
                        <div className="flex gap-3">
                          <button onClick={() => updateProfileData('vote', 'coffee')} className={cn("flex-1 py-3 rounded-xl border transition-colors flex items-center justify-center gap-2", activeProfileData.vote === 'coffee' ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-white/10 bg-white/5 text-brand-200")}>
                            <Coffee className="w-4 h-4" /> Coffee
                          </button>
                          <button onClick={() => updateProfileData('vote', 'gaming')} className={cn("flex-1 py-3 rounded-xl border transition-colors flex items-center justify-center gap-2", activeProfileData.vote === 'gaming' ? "border-purple-400 bg-purple-500/20 text-purple-300" : "border-white/10 bg-white/5 text-brand-200")}>
                            <Gamepad2 className="w-4 h-4" /> Gaming
                          </button>
                        </div>
                        {bothVotedSame && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-emerald-400 text-sm mt-2 text-center font-medium">
                            Ikkalangiz ham {usmonxonData.vote} tanladingiz! 🎉
                          </motion.p>
                        )}
                      </div>

                      <p className="text-sm font-medium text-white mb-3">Sizga qulay vaqtlarni tanlang:</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {allDisplayTimes.map((time, idx) => {
                          const isSelected = activeProfileData.times.includes(time);
                          return (
                            <button key={idx} onClick={() => updateProfileData('times', time)} className={cn("py-2 px-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5", isSelected ? "border-brand-400 bg-brand-500/20 text-white" : "border-white/10 bg-white/5 text-brand-300")}>
                              <Clock className="w-3.5 h-3.5" />{time}
                            </button>
                          );
                        })}
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); if(customTime) { updateProfileData('times', customTime); setCustomTime(""); } }} className="flex gap-2 mb-6">
                        <input type="text" value={customTime} onChange={(e) => setCustomTime(e.target.value)} placeholder="Boshqa vaqt (masalan 15:30)" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-400" />
                        <button type="submit" disabled={!customTime} className="p-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white rounded-xl"><Plus className="w-4 h-4" /></button>
                      </form>

                      {/* Matching Section */}
                      <div className="mt-auto pt-6 border-t border-white/10">
                        <h4 className="text-sm font-medium text-brand-200 mb-4 uppercase tracking-wider">Mos keluvchi vaqtlar</h4>
                        {matchingTimes.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 w-fit">
                              <CheckCircle2 className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">🟢 Ikkalangizga ham mos!</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {matchingTimes.map(time => (
                                <button key={`match-${time}`} onClick={() => { setFinalMatchedTime(time); setStep(3); }} className="py-2 px-4 rounded-xl text-sm font-medium border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200">
                                  {time} - Tanlash
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : hasNoMatchesButBothFilled ? (
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">Bugun mos vaqt topilmadi 😅. Iltimos, boshqa vaqtlarni ham tanlab ko'ring.</div>
                        ) : (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-brand-300 text-sm text-center">Ikkala profil ham o'z vaqtlarini to'liq tanlagach, bu yerda mos vaqtlar chiqadi.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: LOCATION & ACTIVITY */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col h-full overflow-y-auto pr-2 scrollbar-hide">
              <div className="mb-8">
                <h4 className="text-sm font-medium text-brand-200 mb-4 uppercase tracking-wider">1. Qayerda? (Location)</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {LOCATIONS.map(loc => {
                    return (
                      <button key={loc.id} onClick={() => setLocation(loc.id)} className={cn("py-3 px-3 rounded-xl text-sm font-medium border transition-all duration-300 flex items-center gap-2", location === loc.id ? "border-brand-400 bg-brand-500/20 text-white" : "border-white/10 bg-white/5 text-brand-300 hover:bg-white/10")}>
                        <span className="text-lg">{loc.icon}</span> {loc.label}
                      </button>
                    )
                  })}
                </div>
                {location === "custom" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Joy nomini kiriting..." className="w-full bg-white/5 border border-brand-400/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400" />
                  </motion.div>
                )}
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-medium text-brand-200 mb-4 uppercase tracking-wider">2. Nima qilamiz? (Activity)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {ACTIVITIES.map(act => {
                    return (
                      <button key={act.id} onClick={() => setActivity(act.id)} className={cn("py-3 px-3 rounded-xl text-sm font-medium border transition-all duration-300 flex items-center gap-2", activity === act.id ? "border-emerald-400 bg-emerald-500/20 text-white" : "border-white/10 bg-white/5 text-brand-300 hover:bg-white/10")}>
                        <span className="text-lg">{act.icon}</span> {act.label}
                      </button>
                    )
                  })}
                  <button onClick={handleRandomActivity} disabled={isRandomizing} className={cn("py-3 px-3 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center justify-center gap-2 col-span-2", isRandomizing ? "border-indigo-400 bg-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "border-indigo-500/50 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30")}>
                    🎲 BIZ UCHUN TANLA! (RANDOM)
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-4 flex justify-end">
                <button onClick={() => setStep(4)} disabled={!location || (location === 'custom' && !customLocation) || !activity} className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                  Davom etish <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUMMARY CARD */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="flex flex-col h-full">
              <div className="glass-panel border-2 border-brand-500/30 rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-full blur-2xl" />
                <h3 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">Meeting Plan</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30"><CalendarIcon className="w-6 h-6 text-brand-300" /></div>
                    <div><p className="text-sm text-brand-300/80">Date</p><p className="text-lg font-semibold text-white">{selectedDate && format(selectedDate, "EEEE, d MMMM yyyy")}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><Clock className="w-6 h-6 text-emerald-300" /></div>
                    <div><p className="text-sm text-brand-300/80">Time</p><p className="text-lg font-semibold text-emerald-400">{finalMatchedTime}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30"><MapPin className="w-6 h-6 text-orange-300" /></div>
                    <div><p className="text-sm text-brand-300/80">Location</p><p className="text-lg font-semibold text-white">{location === 'custom' ? customLocation : LOCATIONS.find(l => l.id === location)?.label} {" "} {location !== 'custom' && LOCATIONS.find(l => l.id === location)?.icon}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30"><span className="text-2xl">{ACTIVITIES.find(a => a.id === activity)?.icon || "🎯"}</span></div>
                    <div><p className="text-sm text-brand-300/80">Activity</p><p className="text-lg font-semibold text-white">{ACTIVITIES.find(a => a.id === activity)?.label}</p></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition-colors flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" /> Edit</button>
                <button onClick={handleSubmitFinal} disabled={isSubmitting} className="flex-[2] bg-brand-500 hover:bg-brand-400 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-[0_0_20px_rgba(81,123,178,0.3)]">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> CONFIRM</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FULL SCREEN CONFIRMATION ANIMATION */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-2xl bg-dark-900/90">
              <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-brand-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]" />
              </div>
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 relative shadow-[0_0_60px_rgba(239,68,68,0.4)]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring", bounce: 0.6 }} className="absolute inset-0 bg-red-500/20 rounded-full" />
                  <Heart className="w-12 h-12 text-red-500 relative z-10 fill-red-500" />
                </div>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-red-400 mb-6 text-center tracking-tighter leading-tight drop-shadow-2xl">
                  BU KUN <br /> ENDI BIZNIKI.
                </h2>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 6: MEETING CONFIRMED DASHBOARD (COUNTDOWN / MEETING DAY & STATS) */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col h-full w-full py-4 relative overflow-y-auto scrollbar-hide">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                <div className="w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
              </div>

              {bothArrived ? (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-10 w-full">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/20 border border-red-500/40 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                      <Sparkles className="w-6 h-6 text-red-400 animate-pulse" />
                      <span className="text-sm font-bold tracking-widest text-red-300 uppercase">Mission Accomplished</span>
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 text-center uppercase tracking-tight drop-shadow-lg mb-8">
                      🔥 IKKALANGIZ HAM <br/> YETIB KELDINGIZ!
                    </h3>
                    
                    {!showMemoryForm && !memorySuccess && (
                      <button onClick={() => setShowMemoryForm(true)} className="bg-brand-500 hover:bg-brand-400 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-3 shadow-xl transition-all">
                        <ImageIcon className="w-5 h-5" />
                        Bugungi kunni xotira sifatida saqlash
                      </button>
                    )}

                    {showMemoryForm && !memorySuccess && (
                      <form onSubmit={handleMemorySubmit} className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
                        <h4 className="text-xl font-bold text-white mb-2">Yangi Xotira 📸</h4>
                        <textarea 
                          placeholder="Bugungi uchrashuv qanday o'tdi? Nimalar qildik?..."
                          value={memoryNotes}
                          onChange={(e) => setMemoryNotes(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-500 focus:outline-none min-h-[100px]"
                        />
                        <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-brand-300">
                          <input 
                            type="file" multiple accept="image/*"
                            onChange={(e) => setMemoryFiles(Array.from(e.target.files || []))}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-500/20 file:text-brand-300 hover:file:bg-brand-500/30"
                          />
                        </div>
                        <button disabled={isMemorySubmitting} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
                          {isMemorySubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Saqlash"}
                        </button>
                      </form>
                    )}

                    {memorySuccess && (
                      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Xotira saqlandi!</h4>
                        <p className="text-brand-300 text-center mb-6">Rasmlar va xotira muvaffaqiyatli yuklandi.</p>
                        <a href="/memories" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors">
                          Xotiralar galereyasiga o'tish
                        </a>
                      </div>
                    )}
                 </motion.div>
              ) : isMeetingDay ? (
                <div className="flex flex-col items-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6 animate-pulse">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold tracking-wide text-red-300 uppercase">Meeting Day 🔥</span>
                  </div>
                  
                  <h3 className="text-6xl sm:text-8xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl">
                    TODAY
                  </h3>

                  {bookingLocation && (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl mb-8">
                      <MapPin className="w-6 h-6 text-orange-400" />
                      <span className="text-lg text-white font-medium">{bookingLocation}</span>
                    </div>
                  )}

                  <div className="w-full max-w-sm flex flex-col gap-4">
                    <p className="text-sm text-center text-brand-300 mb-2">Manzilga yetib kelgach tugmani bosing:</p>
                    <button 
                      onClick={() => handleArrival('Usmonxon')} 
                      disabled={usmonxonArrived || isArrivalLoading}
                      className={cn("w-full py-4 rounded-xl font-bold transition-all shadow-lg text-lg flex items-center justify-center gap-2", usmonxonArrived ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-brand-500 hover:bg-brand-400 text-white")}
                    >
                      {usmonxonArrived ? <><CheckCircle2 className="w-5 h-5" /> Usmonxon yetib keldi</> : "Usmonxon - I'M HERE!"}
                    </button>
                    
                    <button 
                      onClick={() => handleArrival('Muhiddinxon')} 
                      disabled={muhiddinxonArrived || isArrivalLoading}
                      className={cn("w-full py-4 rounded-xl font-bold transition-all shadow-lg text-lg flex items-center justify-center gap-2", muhiddinxonArrived ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-indigo-500 hover:bg-indigo-400 text-white")}
                    >
                      {muhiddinxonArrived ? <><CheckCircle2 className="w-5 h-5" /> Muhiddinxon yetib keldi</> : "Muhiddinxon - I'M HERE!"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 mt-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold tracking-wide text-emerald-300 uppercase">Meeting Confirmed</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl text-brand-200 mb-10 font-medium tracking-wide">Uchrashuvga qoldi:</h3>

                  <div className="flex gap-3 sm:gap-6 md:gap-8 justify-center mb-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-20 sm:w-24 sm:h-28 glass-panel rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(81,123,178,0.2)] border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 border-b border-white/5" />
                        <span className="text-3xl sm:text-5xl font-bold text-white relative z-10 tabular-nums">{timeLeft.days.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-[10px] sm:text-sm font-bold text-brand-300/80 uppercase tracking-widest">Days</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-20 sm:w-24 sm:h-28 glass-panel rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(81,123,178,0.2)] border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 border-b border-white/5" />
                        <span className="text-3xl sm:text-5xl font-bold text-white relative z-10 tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-[10px] sm:text-sm font-bold text-brand-300/80 uppercase tracking-widest">Hours</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-20 sm:w-24 sm:h-28 glass-panel rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(81,123,178,0.2)] border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 border-b border-white/5" />
                        <span className="text-3xl sm:text-5xl font-bold text-white relative z-10 tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-[10px] sm:text-sm font-bold text-brand-300/80 uppercase tracking-widest">Mins</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-20 sm:w-24 sm:h-28 glass-panel rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(81,123,178,0.2)] border border-brand-400/30 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-brand-500/10 border-b border-brand-400/20" />
                        <span className="text-3xl sm:text-5xl font-bold text-brand-300 relative z-10 tabular-nums">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-[10px] sm:text-sm font-bold text-brand-400/80 uppercase tracking-widest">Secs</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Friendship Stats Section */}
              <div className="w-full max-w-2xl mx-auto pt-8 border-t border-white/10 mt-auto">
                <h4 className="text-sm font-bold text-brand-300 mb-6 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Friendship Stats
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center"><CalendarIcon className="w-5 h-5 text-brand-400" /></div>
                    <span className="text-2xl font-bold text-white">{stats.meetings}</span>
                    <span className="text-xs text-brand-300 uppercase">Meetings</span>
                  </div>
                  <div className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center"><Coffee className="w-5 h-5 text-orange-400" /></div>
                    <span className="text-2xl font-bold text-white">{stats.coffees}</span>
                    <span className="text-xs text-brand-300 uppercase">Coffees</span>
                  </div>
                  <div className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-purple-400" /></div>
                    <span className="text-2xl font-bold text-white">{stats.gaming}</span>
                    <span className="text-xs text-brand-300 uppercase">Gaming</span>
                  </div>
                  <div className="glass-panel rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-pink-400" /></div>
                    <span className="text-2xl font-bold text-white">{stats.memories}</span>
                    <span className="text-xs text-brand-300 uppercase">Memories</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
