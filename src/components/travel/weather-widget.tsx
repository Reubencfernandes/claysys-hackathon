/**
 * WeatherWidget -- Shows current weather and a multi-day forecast for a city.
 *
 * The top section highlights today's conditions (icon, description, high/low
 * temps, humidity, wind speed). The footer renders up to four upcoming days as
 * compact mini-cards. The whole widget links to Google's weather search.
 */
"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WeatherForecast } from "@/lib/types";
import { CloudSun, Droplets, Wind, ExternalLink } from "lucide-react";

// OpenWeatherMap icon codes mapped to emoji for lightweight rendering without
// loading external icon assets.
const weatherIcons: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "⛅", "02n": "☁️",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "🌨️", "13n": "🌨️",
  "50d": "🌫️", "50n": "🌫️",
};

/**
 * Converts a YYYY-MM-DD date string into a friendly label:
 * "Today", "Tomorrow", or a short weekday name (e.g. "Wed").
 * Appending T00:00:00 avoids timezone-shift issues with Date parsing.
 */
function getDayName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function WeatherWidget({ data }: { data: WeatherForecast }) {
  if (!data?.forecast?.length) return null;

  // The first forecast entry is always "today" -- used for the hero section.
  const today = data.forecast[0];

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`weather in ${data.city} ${data.country}`)}`;

  return (
    <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.01]">
    <Card className="w-full max-w-md border border-blue-500/20 bg-[#10141d] text-white/90 shadow-lg shadow-black/30 backdrop-blur-sm cursor-pointer hover:border-blue-500/40 transition-colors">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-3 pr-20 text-sm text-white/90">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
            <CloudSun className="h-4 w-4" />
          </span>
          Weather in {data.city}, {data.country}
          <ExternalLink className="h-3 w-3 text-white/30 shrink-0" />
        </CardTitle>
        <CardDescription className="pl-12 text-xs capitalize text-white/55">
          {today.description}
        </CardDescription>
        <CardAction className="space-y-0.5 text-right">
          <p className="text-3xl font-semibold text-white/80">
            {today.temp_max}°C
          </p>
          <p className="text-xs text-white/55">
            Low {today.temp_min}°C
          </p>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/4 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl ring-1 ring-blue-400/15">
            {weatherIcons[today.icon] || "🌤️"}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">
              {getDayName(today.date)}
            </p>
            <p className="text-sm text-white/60 capitalize">
              {today.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-white/55">
              <Droplets className="h-3.5 w-3.5 text-blue-300" />
              Humidity
            </p>
            <p className="mt-2 text-lg font-semibold text-white/80">
              {today.humidity}%
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-white/55">
              <Wind className="h-3.5 w-3.5 text-blue-300" />
              Wind
            </p>
            <p className="mt-2 text-lg font-semibold text-white/80">
              {today.wind_speed} m/s
            </p>
          </div>
        </div>
      </CardContent>

      {/* Multi-day forecast strip: show the next 4 days (skipping today) as
          compact pill-style cards in a horizontally scrollable footer. */}
      {data.forecast.length > 1 && (
        <CardFooter className="gap-2 overflow-x-auto border-white/8 bg-white/3">
          {data.forecast.slice(1, 5).map((day) => (
            <div
              key={day.date}
              className="min-w-18 rounded-xl border border-white/8 bg-white/5 p-2.5 text-center"
            >
              <span className="text-[11px] font-medium text-white/50">
                {getDayName(day.date)}
              </span>
              <div className="my-2 text-lg">
                {weatherIcons[day.icon] || "🌤️"}
              </div>
              <div className="text-xs font-semibold text-white/80">
                {day.temp_max}°
              </div>
              <div className="text-[11px] text-white/45">
                {day.temp_min}°
              </div>
            </div>
          ))}
        </CardFooter>
      )}
    </Card>
    </a>
  );
}
