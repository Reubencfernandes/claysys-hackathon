/**
 * PlaceCard -- Renders a list of place/venue results (restaurants, attractions, etc.)
 * as visually rich cards sourced from the Foursquare API.
 *
 * Each card shows the place's photo (if available), name, address, star rating,
 * review count, price level, and category tags. Cards link to Google Maps so the
 * user can get directions or read more reviews.
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
import type { PlacesResponse } from "@/lib/types";
import { MapPin, Star, ExternalLink } from "lucide-react";

/**
 * Renders a visual dollar-sign price indicator (e.g. "$$$$").
 * Filled signs represent the cost; faded signs show the remaining scale.
 * Level 0 = "$", level 3 = "$$$$".
 */
function PriceLevel({ level }: { level: number | null }) {
  if (level === null) return null;
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
      {"$".repeat(level + 1)}
      <span className="opacity-30">{"$".repeat(Math.max(0, 3 - level))}</span>
    </span>
  );
}

/** Compact pill showing a numeric star rating with a filled star icon. */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-amber-400/15 bg-amber-400/10 px-2 py-1 text-amber-100">
      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

// Foursquare returns human-readable category names directly, so no
// ID-to-label mapping is needed -- we display the type strings as-is.

export function PlaceCard({ data }: { data: PlacesResponse }) {
  if (!data?.places?.length) return null;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p className="px-1 text-xs font-medium text-white/60">
        <MapPin className="h-3 w-3 inline mr-1" />
        Places found for &quot;{data.query}&quot; in {data.location}
      </p>
      {data.places.map((place, i) => {
        // Prefer lat/lng coordinates for the Google Maps link when available;
        // fall back to a name-based search if the API returned zeroed coords.
        const mapsUrl = place.location.lat !== 0
          ? `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + data.location)}`;

        return (
        <a
          key={i}
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform hover:scale-[1.01]"
        >
        <Card
          size="sm"
          className="overflow-hidden border border-emerald-500/20 bg-[#10141d] text-white/90 shadow-lg shadow-black/30 backdrop-blur-sm cursor-pointer hover:border-emerald-500/40 transition-colors"
        >
          {place.photo_url && (
            <>
              {/* Third-party place photos are rendered directly from the provider URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={place.photo_url}
                alt={place.name}
                className="h-36 w-full object-cover"
              />
            </>
          )}
          <CardHeader className="gap-2">
            <CardTitle className="pr-12 text-sm leading-5 text-white/90">
              {place.name}
            </CardTitle>
            <CardDescription className="flex items-start gap-1.5 text-xs leading-5 text-white/60">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
              <span className="line-clamp-2">{place.address}</span>
            </CardDescription>
            {place.location.lat !== 0 && (
              <CardAction>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${place.name} in Google Maps`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/55 transition-colors hover:text-white/90"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardAction>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StarRating rating={place.rating} />
              <span className="text-xs text-white/50">
                ({place.user_ratings_total.toLocaleString()} reviews)
              </span>
              <PriceLevel level={place.price_level} />
            </div>
          </CardContent>

          {/* Category tags (e.g. "Italian Restaurant", "Coffee Shop") shown as badges */}
          {place.types.length > 0 && (
            <CardFooter className="flex-wrap items-center gap-2 border-white/8 bg-white/3">
              {place.types.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="rounded-full border border-white/10 bg-white/5 text-[10px] text-white/70"
                >
                  {type}
                </Badge>
              ))}
            </CardFooter>
          )}
        </Card>
        </a>
        );
      })}
    </div>
  );
}
