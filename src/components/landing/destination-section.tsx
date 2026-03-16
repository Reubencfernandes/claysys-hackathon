"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal, MapPin, Users, Heart } from "lucide-react";

const destinations = [
  {
    title: "Uluwatu",
    location: "Badung Regency, Bali",
    price: "$23.30",
    image: "/uluwatu_bali_cliff_1773489492170.png",
    status: "Open Trip",
    dates: "12-14 August",
    slots: "4 Left",
  },
  {
    title: "Toba Lake",
    location: "Sumatra",
    price: "$450",
    image: "/toba_lake_sumatra_1773489511332.png",
    status: "Open Trip",
    dates: "Request Based",
    slots: "5 Left",
  },
  {
    title: "Sumba Adventure",
    location: "West Sumba",
    price: "$22.50",
    image: "/sumba_horses_plains_adventure_1773489530356.png",
    status: "Open Trip",
    dates: "12-14 August",
    slots: "2 Left",
  }
];

export function DestinationSection() {
  return (
    <section className="bg-white py-24 text-black px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-6"
            >
               <span className="h-[1px] w-8 bg-black/20" />
               <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-black/40">Popular Destination 2025</span>
            </motion.div>
            <motion.h2
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
              className="text-6xl font-bold tracking-tight"
            >
              Pick the Place
            </motion.h2>
          </div>
          <motion.p
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
            className="text-black/50 font-medium max-w-xs leading-relaxed"
          >
            We have great options for everyone and cozy spots for your squad to enjoy together!
          </motion.p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#f8f9fa] rounded-2xl p-2 mb-12 flex flex-col md:flex-row items-center gap-2 border border-gray-100">
          <div className="flex-1 flex flex-col md:flex-row gap-2 w-full">
            <FilterItem label="Destination" value="Find a spot..." icon={MapPin} />
            <FilterItem label="Category" value="Select type" icon={SlidersHorizontal} />
            <FilterItem label="Price" value="Select range budget" icon={ChevronDown} />
            <FilterItem label="Date" value="Select date range" icon={Calendar} />
          </div>
          <Button className="bg-black text-white hover:bg-black/90 rounded-xl px-8 h-12 uppercase text-[10px] font-bold tracking-widest shadow-lg">
            Discover
          </Button>
        </div>

        {/* Real Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <motion.div
               key={dest.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: i * 0.1 }}
               className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
                <img src={dest.image} alt={dest.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                   <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[8px] font-bold tracking-[0.2em] text-white uppercase">
                    {dest.slots}
                  </div>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white hover:text-black transition-colors cursor-pointer text-white">
                    <Heart size={14} />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                       <div className="px-2 py-0.5 bg-white/20 rounded text-[8px] font-bold uppercase tracking-wider text-white">
                         Open Trip
                       </div>
                    </div>
                    <div className="flex items-center justify-between text-white text-[9px] font-bold uppercase tracking-widest opacity-80">
                       <span className="flex items-center gap-1"><Users size={10} /> {dest.price}</span>
                       <span className="flex items-center gap-1">Open Trip</span>
                       <span>{dest.dates}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-1 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">{dest.title}</h3>
                  <p className="text-sm text-black/40 font-medium">{dest.location}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full hover:bg-black hover:text-white transition-all cursor-pointer">
                   <SlidersHorizontal size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex-1 bg-white rounded-xl p-4 border border-transparent hover:border-gray-100 transition-colors cursor-pointer group">
      <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-black/30 mb-2 group-hover:text-black/50 transition-colors">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-black/60">{value}</span>
        <Icon className="h-3 w-3 text-black/20 group-hover:text-black/40 transition-colors" />
      </div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}
