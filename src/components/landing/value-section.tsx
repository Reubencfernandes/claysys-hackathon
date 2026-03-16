"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ValueSection() {
  return (
    <section className="bg-white py-32 md:py-48 text-black overflow-hidden mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 md:gap-24">
        {/* Left Content */}
        <div className="flex-1 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="h-[1px] w-8 bg-black/20" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-black/40">Our Value</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold leading-[1.1] mb-8 tracking-tight"
          >
            Not Your Boring Travel Agent
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-black/60 font-medium mb-12 max-w-md leading-relaxed"
          >
            We plan chill, curated trips with good vibes and better people. Our goal is to make travel effortless and unforgettable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button className="rounded-full px-10 py-7 h-auto bg-black text-white hover:bg-black/90 font-bold tracking-wider text-xs uppercase shadow-xl transition-transform hover:scale-105">
              Book a Seat
            </Button>
          </motion.div>
        </div>

        {/* Right Image Grid */}
        <div className="flex-1 relative flex gap-4 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group w-2/3"
          >
            <img 
              src="/green_hills_bali_1773489434187.png" 
              alt="Hills in Bali" 
              className="rounded-2xl w-full h-[500px] object-cover shadow-2xl"
            />
            <div className="absolute bottom-6 left-6 text-white z-10">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Bangli, East Bali</p>
              <p className="text-[10px] font-medium opacity-60">Cultural walk with local guides</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl" />
          </motion.div>

          <div className="flex flex-col gap-4 w-1/3">
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group"
            >
              <img 
                src="/black_bull_field_1773489450576.png" 
                alt="Bull in field" 
                className="rounded-2xl w-full h-[240px] object-cover shadow-xl"
              />
              <div className="absolute bottom-4 left-4 text-white z-10 text-[8px] font-bold opacity-80 uppercase tracking-widest">
                Uluwatu
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent rounded-b-2xl" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative group"
            >
              <img 
                src="/coastal_yurts_camp_1773489466816.png" 
                alt="Coastal yurt" 
                className="rounded-2xl w-full h-[240px] object-cover shadow-xl"
              />
               <div className="absolute bottom-4 left-4 text-white z-10 text-[8px] font-bold opacity-80 uppercase tracking-widest">
                Sumba Edge
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent rounded-b-2xl" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
