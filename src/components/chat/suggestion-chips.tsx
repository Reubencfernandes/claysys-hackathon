/**
 * SuggestionChips -- Renders pre-written travel prompts as clickable pill
 * buttons on the chat landing screen.
 *
 * Clicking a chip populates the chat input with the corresponding prompt text,
 * giving new users instant inspiration and reducing the blank-page problem.
 * Each chip animates in with a staggered fade-up effect via Framer Motion.
 */
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Curated starter prompts that showcase the assistant's travel-planning
// capabilities across different trip types (budget, romantic, adventure, etc.).
const suggestions = [
  "Plan a 5-day trip to Tokyo on a $2000 budget",
  "Help me explore Paris, I love art and food",
  "Weekend getaway for nature lovers under $800",
  "Romantic week in Santorini for two people",
  "Adventure trip to Iceland with aurora viewing",
];

export function SuggestionChips({
  onSuggestionClick,
}: {
  onSuggestionClick: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center max-w-xl">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={suggestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            // Stagger each chip by 100ms so they cascade in from top to bottom.
            duration: 0.3,
            delay: index * 0.1,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <Button
            variant="outline"
            onClick={() => onSuggestionClick(suggestion)}
            className="bg-card/40 backdrop-blur-sm border-2 border-primary/20 hover:border-accent hover:bg-accent/10 text-foreground hover:text-accent transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium text-sm px-4 py-2 h-auto rounded-full"
          >
            {suggestion}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
