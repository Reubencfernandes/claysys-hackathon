"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HighFidelityHero() {
  return (
    <section className="relative h-[85vh] w-full flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_mountains_yurts_1773489414489.png"
          alt="Mountains and Yurts"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-8xl md:text-[10rem] font-bold tracking-tight mb-2 leading-none"
        >
          Travel
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl font-medium tracking-wide max-w-md mx-auto opacity-90"
        >
          Travel with intention. Discover retreats, active adventures, and boutique stays all in one place.
        </motion.p>
      </div>

      {/* Search Bar Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-0 w-full max-w-5xl px-4 translate-y-1/2 z-20"
      >
        <div className="bg-[#1a130c]/90 backdrop-blur-md rounded-xl p-1 flex flex-col md:flex-row shadow-2xl overflow-hidden border border-white/10">
          <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Activity/Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 opacity-70" />
              <input 
                type="text" 
                placeholder="Yoga / Surf / Cycling" 
                className="bg-transparent border-none text-white focus:ring-0 placeholder:text-white/30 text-sm font-medium w-full"
              />
            </div>
          </div>
          
          <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Location</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-70" />
              <input 
                type="text" 
                placeholder="Kazakhstan" 
                className="bg-transparent border-none text-white focus:ring-0 placeholder:text-white/30 text-sm font-medium w-full"
              />
            </div>
          </div>

          <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Date/Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-70" />
              <input 
                type="text" 
                placeholder="Anytime / 3 days" 
                className="bg-transparent border-none text-white focus:ring-0 placeholder:text-white/30 text-sm font-medium w-full"
              />
            </div>
          </div>

          <div className="flex-1 px-6 py-5 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 opacity-70" />
              <input 
                type="text" 
                placeholder="$0 - $1000" 
                className="bg-transparent border-none text-white focus:ring-0 placeholder:text-white/30 text-sm font-medium w-full"
              />
            </div>
          </div>

          <div className="bg-white flex items-center justify-center min-w-[140px]">
            <Button variant="ghost" className="h-full w-full rounded-none text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors">
              Explore
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
