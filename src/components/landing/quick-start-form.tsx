import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AirplaneTilt } from "@phosphor-icons/react";

const interests = [
  "Culture & History",
  "Food & Cuisine",
  "Adventure & Outdoors",
  "Relaxation & Spa",
  "Nightlife & Entertainment",
  "Shopping",
  "Art & Museums",
  "Nature & Wildlife",
];

const budgetOptions = [
  { label: "Budget", value: "budget ($500-1000)" },
  { label: "Mid-Range", value: "mid-range ($1000-3000)" },
  { label: "Luxury", value: "luxury ($3000+)" },
];

export function QuickStartForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;

    let message = `Plan a trip to ${destination}`;
    if (duration) message += ` for ${duration} days`;
    if (budget) message += ` with a ${budget}`;
    if (selectedInterests.length > 0) {
      message += `. I'm interested in: ${selectedInterests.join(", ")}`;
    }

    router.push(`/?message=${encodeURIComponent(message)}`);
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card/80 backdrop-blur-md border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Quick Start</CardTitle>
            <p className="text-sm text-foreground/60">
              Fill in the basics and jump straight into planning
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Where do you want to go?
                </label>
                <Input
                  placeholder="e.g., Tokyo, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-background/50 border-primary/20 focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">How many days?</label>
                <Input
                  type="number"
                  placeholder="e.g., 5"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-background/50 border-primary/20 focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Budget</label>
                <div className="flex gap-2 flex-wrap">
                  {budgetOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={
                        budget === option.value ? "default" : "outline"
                      }
                      className={`cursor-pointer px-3 py-1.5 text-sm transition-all duration-200 hover:scale-105 ${
                        budget === option.value
                          ? "bg-gradient-to-r from-primary to-accent border-transparent"
                          : "border-primary/20 hover:border-accent"
                      }`}
                      onClick={() =>
                        setBudget(budget === option.value ? "" : option.value)
                      }
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Interests</label>
                <div className="flex gap-2 flex-wrap">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        selectedInterests.includes(interest)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer px-3 py-1.5 text-sm transition-all duration-200 hover:scale-105 ${
                        selectedInterests.includes(interest)
                          ? "bg-gradient-to-r from-primary to-accent border-transparent"
                          : "border-primary/20 hover:border-accent"
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full gap-2 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
                size="lg"
                disabled={!destination.trim()}
              >
                <AirplaneTilt size={20} weight="fill" />
                Start Planning
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
