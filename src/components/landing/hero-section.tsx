"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
        >
          Plan Your Next{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic">
            Adventure
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 font-medium"
        >
          Discover hidden gems and create unforgettable memories with our
          personalized, AI-powered travel planner.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Link href="/chat" className="group relative p-[2px] rounded-full overflow-hidden">
            {/* Animated border effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                opacity: 0,
              }}
              whileHover={{ opacity: 1 }}
            />
            
            <Button
              size="lg"
              className="relative rounded-full px-12 py-8 text-lg font-semibold bg-background hover:bg-background/80 text-foreground border border-primary/20 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
            >
              Start Planning
              <motion.span 
                className="ml-2 inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                &rarr;
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
