"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    label: "AI",
    title: "AI-Powered Planning",
    description:
      "Gemini AI creates personalized day-by-day itineraries based on your preferences and budget.",
    gradient: "from-primary to-accent",
  },
  {
    label: "W",
    title: "Real-Time Weather",
    description:
      "Live weather forecasts for your destination to help you plan activities.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    label: "$",
    title: "Live Exchange Rates",
    description:
      "Up-to-date currency conversion so you can budget for any destination.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    label: "P",
    title: "Place Ratings",
    description:
      "Top-rated attractions, restaurants, and hotels with reviews and directions.",
    gradient: "from-accent to-pink-500",
  },
];

export function FeatureCards() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Everything You Need
        </h2>
        <p className="text-foreground/60">
          Powered by AI with real-time data
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <Card className="bg-card/60 backdrop-blur-md border border-primary/10 hover:border-primary/25 transition-colors duration-200">
              <CardContent className="p-5 flex gap-4">
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0 text-white font-bold text-sm`}
                >
                  {feature.label}
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-foreground/50">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
