/**
 * FlightCard -- Renders flight search results as rich, clickable cards.
 *
 * When flights are found, each flight is displayed with airline info, departure/
 * arrival airports, times, delay status, and terminal/gate details. Every card
 * links out to a Google search so the user can book or track the flight.
 *
 * When no flights match the query, a single fallback card links to Google Flights
 * so the user still has a path forward.
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
import { Badge } from "@/components/ui/badge";
import type { FlightsResponse } from "@/lib/types";
import { Plane, ArrowRight, ExternalLink } from "lucide-react";

/** Extract a human-readable 12-hour time string from an ISO date, with a safe fallback. */
function formatTime(dateStr: string): string {
  if (!dateStr) return "--:--";
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr.slice(11, 16) || "--:--";
  }
}

/** Map a flight status string to Tailwind color classes for the status badge. */
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "border-green-400/20 bg-green-400/15 text-green-200";
    case "landed":
      return "border-blue-400/20 bg-blue-400/15 text-blue-200";
    case "cancelled":
      return "border-red-400/20 bg-red-400/15 text-red-200";
    case "diverted":
      return "border-orange-400/20 bg-orange-400/15 text-orange-200";
    case "scheduled":
    default:
      return "border-white/10 bg-white/[0.05] text-white/55";
  }
}

/** Build a concise "Terminal X . Gate Y" string, falling back to a placeholder
 *  when neither piece of information is available yet. */
function formatStopMeta(terminal: string | null, gate: string | null): string {
  const details = [
    terminal ? `Terminal ${terminal}` : null,
    gate ? `Gate ${gate}` : null,
  ].filter(Boolean);

  return details.join(" • ") || "Details pending";
}

export function FlightCard({ data }: { data: FlightsResponse & { search_url?: string } }) {
  if (!data) return null;

  // When the API returns no matching flights, render a single CTA card that
  // links to Google Flights so the user can still search manually.
  if (!data.flights?.length) {
    const searchUrl = data.search_url || `https://www.google.com/travel/flights?q=flights+from+${data.dep_city}+to+${data.arr_city}`;
    return (
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-md"
      >
        <Card
          size="sm"
          className="border border-violet-500/20 bg-[#10141d] text-white/90 shadow-lg shadow-black/30 backdrop-blur-sm cursor-pointer hover:border-violet-500/40 transition-colors"
        >
          <CardContent className="flex items-center gap-3 text-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
              <Plane className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-white/80">Search flights {data.dep_city} to {data.arr_city}</p>
              <p className="text-xs text-white/50 flex items-center gap-1">View on Google Flights <ExternalLink className="h-3 w-3" /></p>
            </div>
          </CardContent>
        </Card>
      </a>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p className="px-1 text-xs font-medium text-white/60">
        <Plane className="h-3 w-3 inline mr-1" />
        Flights from {data.dep_city} to {data.arr_city}
        {data.date && (
          <span className="ml-1 text-white/40">• {data.date}</span>
        )}
      </p>
      {data.flights.map((flight, i) => {
        // Build a Google search URL from the airline + flight number + route so
        // the user lands on a relevant tracking/booking page when they click.
        const searchQuery = `${flight.airline.name} ${flight.flight.iata || flight.flight.number || ""} flight ${flight.departure.iata} to ${flight.arrival.iata}`;
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

        return (
        <a
          key={i}
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform hover:scale-[1.01]"
        >
        <Card
          size="sm"
          className="border border-violet-500/20 bg-[#10141d] text-white/90 shadow-lg shadow-black/30 backdrop-blur-sm cursor-pointer hover:border-violet-500/40 transition-colors"
        >
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-3 pr-16 text-sm text-white/90">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
                <Plane className="h-4 w-4" />
              </span>
              <span className="truncate">{flight.airline.name}</span>
            </CardTitle>
            <CardDescription className="pl-12 text-xs text-white/55 flex items-center gap-1.5">
              {flight.flight.iata || flight.flight.number || "Flight details"}
              <ExternalLink className="h-3 w-3 text-white/30" />
            </CardDescription>
            <CardAction>
              <Badge
                variant="outline"
                className={`h-6 rounded-full px-2.5 text-[10px] font-medium capitalize ${getStatusColor(flight.flight_status)}`}
              >
                {flight.flight_status}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Departure -> Arrival visual: three-column grid with airports on each side
                and a directional arrow + delay indicator in the center. */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
              <div className="min-w-0 text-left">
                <p className="text-xl font-semibold tracking-tight text-white/90">
                  {flight.departure.iata}
                </p>
                <p className="text-sm font-medium text-white/80">
                  {formatTime(flight.departure.scheduled)}
                </p>
                <p className="mt-1 truncate text-[11px] text-white/45">
                  {flight.departure.airport}
                </p>
              </div>

              {/* Center column: arrow icon plus delay badge (red) or "On time" label */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <ArrowRight className="h-4 w-4 text-violet-300" />
                {flight.departure.delay && flight.departure.delay > 0 ? (
                  <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-medium text-red-200">
                    +{flight.departure.delay}m
                  </span>
                ) : (
                  <span className="text-[10px] text-white/45">
                    On time
                  </span>
                )}
              </div>

              <div className="min-w-0 text-right">
                <p className="text-xl font-semibold tracking-tight text-white/90">
                  {flight.arrival.iata}
                </p>
                <p className="text-sm font-medium text-white/80">
                  {formatTime(flight.arrival.scheduled)}
                </p>
                <p className="mt-1 truncate text-[11px] text-white/45">
                  {flight.arrival.airport}
                </p>
              </div>
            </div>
          </CardContent>

          {/* Footer shows terminal/gate info for both ends of the route */}
          <CardFooter className="grid grid-cols-2 items-start gap-3 border-white/8 bg-white/3 text-xs">
            <div className="min-w-0">
              <p className="font-medium text-white/50">Departure</p>
              <p className="truncate text-white/70">
                {formatStopMeta(
                  flight.departure.terminal,
                  flight.departure.gate
                )}
              </p>
            </div>

            <div className="min-w-0 text-right">
              <p className="font-medium text-white/50">Arrival</p>
              <p className="truncate text-white/70">
                {formatStopMeta(flight.arrival.terminal, flight.arrival.gate)}
              </p>
            </div>
          </CardFooter>
        </Card>
        </a>
        );
      })}
    </div>
  );
}
