/**
 * ToolResultRenderer -- Bridges the AI SDK's tool-call lifecycle with the
 * travel-specific UI cards (weather, places, currency, flights).
 *
 * The AI SDK streams tool calls through several states:
 *   input-streaming / input-available / approval-requested  ->  loading UI
 *   output-error                                             ->  error UI
 *   output-available                                         ->  rich result card
 *
 * This component inspects the tool name and current state, then delegates to
 * the appropriate travel card component or shows a loading/error placeholder.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { WeatherWidget } from "@/components/travel/weather-widget";
import { PlaceCard } from "@/components/travel/place-card";
import { CurrencyConverter } from "@/components/travel/currency-converter";
import { FlightCard } from "@/components/travel/flight-card";
import { CloudSun, MapPin, ArrowRightLeft, Loader2, Plane } from "lucide-react";

/** Shape of a tool invocation part as provided by the AI SDK streaming protocol. */
interface ToolPart {
  type: string;
  toolCallId: string;
  toolName?: string;
  state: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorText?: string;
}

/** Skeleton-style card shown while a tool call is in progress. */
function ToolLoading({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <Card
      size="sm"
      className="w-full max-w-md border border-dashed border-white/10 bg-[#10141d] text-white/80 shadow-lg shadow-black/30 backdrop-blur-sm"
    >
      <CardContent className="flex items-center gap-2 text-sm text-white/65">
        <Icon className="h-4 w-4 text-white/55" />
        <Loader2 className="h-3 w-3 animate-spin text-white/55" />
        <span>{text}</span>
      </CardContent>
    </Card>
  );
}

/** Compact error card displayed when a tool call fails. */
function ToolError({ text }: { text: string }) {
  return (
    <Card
      size="sm"
      className="w-full max-w-md border border-red-500/20 bg-[#10141d] text-white/80 shadow-lg shadow-black/30 backdrop-blur-sm"
    >
      <CardContent className="text-sm text-red-300">{text}</CardContent>
    </Card>
  );
}

/**
 * Extracts a canonical tool name from the part's type field.
 * AI SDK v6 encodes static tool names as "tool-<name>" in the type string,
 * while dynamic tools use a separate `toolName` property.
 */
function getToolName(part: ToolPart): string {
  if (part.type.startsWith("tool-")) {
    return part.type.slice(5);
  }
  return part.toolName || "unknown";
}

export function ToolResultRenderer({ part }: { part: ToolPart }) {
  const toolName = getToolName(part);
  const { state, input, output } = part;

  // While the tool call is still being assembled or awaiting approval, show a
  // contextual loading indicator with an icon and message matching the tool type.
  if (
    state === "input-streaming" ||
    state === "input-available" ||
    state === "approval-requested"
  ) {
    const args = (input || {}) as Record<string, string>;
    switch (toolName) {
      case "getWeather":
        return (
          <ToolLoading
            icon={CloudSun}
            text={`Checking weather for ${args.city || "destination"}...`}
          />
        );
      case "getPlaceDetails":
        return (
          <ToolLoading
            icon={MapPin}
            text={`Finding places: ${args.query || "searching"}...`}
          />
        );
      case "getCurrencyRate":
        return (
          <ToolLoading
            icon={ArrowRightLeft}
            text={`Getting exchange rate ${args.from || ""} → ${args.to || ""}...`}
          />
        );
      case "searchFlights":
        return (
          <ToolLoading
            icon={Plane}
            text={`Searching flights ${args.dep_iata || ""} → ${args.arr_iata || ""}...`}
          />
        );
      default:
        return (
          <ToolLoading icon={Loader2} text={`Running ${toolName}...`} />
        );
    }
  }

  // Error state
  if (state === "output-error") {
    return (
      <ToolError
        text={part.errorText || `Failed to get data from ${toolName}`}
      />
    );
  }

  // Once the tool has returned data, delegate rendering to the matching
  // travel card component. An `error` field in the output is treated as
  // a soft failure and displayed via the error card instead.
  if (state === "output-available" && output) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = output as any;

    if (data.error) {
      return <ToolError text={`Failed to get data: ${data.error}`} />;
    }

    switch (toolName) {
      case "getWeather":
        return <WeatherWidget data={data} />;
      case "getPlaceDetails":
        return <PlaceCard data={data} />;
      case "getCurrencyRate":
        return <CurrencyConverter data={data} />;
      case "searchFlights":
        return <FlightCard data={data} />;
      default:
        return null;
    }
  }

  return null;
}
