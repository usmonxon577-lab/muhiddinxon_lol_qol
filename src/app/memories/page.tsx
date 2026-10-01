"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Loader2, Camera, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Memory {
  _id: string;
  date: string;
  location: string;
  activity: string;
  notes: string;
  photos: string[];
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memories")
      .then((res) => res.json())
      .then((data) => {
        setMemories(data.memories || []);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  const grouped = memories.reduce((acc, mem) => {
    const d = new Date(mem.date);
    if (isNaN(d.getTime())) return acc;
    const monthYear = format(d, "MMMM yyyy");
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(mem);
    return acc;
  }, {} as Record<string, Memory[]>);

  return (
    <div className="min-h-screen bg-dark-900 text-white p-6 sm:p-12 md:p-20 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-brand-300" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">Memory Timeline</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/10">
            <Camera className="w-12 h-12 text-brand-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-brand-200">Hali xotiralar yo'q</h3>
            <p className="text-brand-300/60 mt-2">Uchrashuvlaringizni o'tkazing va bu yerga xotiralar qo'shing!</p>
          </div>
        ) : (
          <div className="space-y-16 relative">
            {/* Timeline Line */}
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-purple-500/50 to-transparent -z-10" />

            {Object.keys(grouped).map((monthYear, idx) => (
              <motion.div 
                key={monthYear} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-brand-300" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white uppercase tracking-widest">{monthYear}</h2>
                </div>

                <div className="space-y-10 pl-10 sm:pl-20">
                  {grouped[monthYear].map((mem) => (
                    <div key={mem._id} className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 hover:border-brand-500/30 transition-all shadow-xl group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <p className="text-brand-400 font-semibold mb-1 text-sm">{format(new Date(mem.date), "EEEE, d MMMM")}</p>
                          <h3 className="text-xl font-bold text-white uppercase">{mem.activity}</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg w-fit">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-medium text-brand-200">{mem.location}</span>
                        </div>
                      </div>

                      {mem.notes && (
                        <p className="text-brand-100/80 mb-6 italic border-l-2 border-brand-500/50 pl-4">"{mem.notes}"</p>
                      )}

                      {mem.photos && mem.photos.length > 0 && (
                        <div className={mem.photos.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 sm:grid-cols-3 gap-3"}>
                          {mem.photos.map((photo, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group/img cursor-pointer">
                              <Image 
                                src={photo} 
                                alt={`Memory ${i}`} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/0 transition-colors" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
