/**
 * AI Tool Definitions for the Travel Planning Assistant
 *
 * This file defines the tools that the AI model can invoke during a conversation.
 * Each tool maps to an internal API route that proxies requests to a third-party
 * service (weather API, places API, etc.). The Vercel AI SDK's `tool()` helper
 * is used to declare each tool's description (which the LLM reads to decide when
 * to call it) and its input schema (validated with Zod before execution).
 *
 * When the AI decides it needs real-time data (e.g., weather for Paris), it emits
 * a tool call. The SDK validates the parameters against the Zod schema, runs the
 * `execute` function, and feeds the result back into the model's context so it
 * can incorporate live data into its response.
 */

import type { NextApiRequest } from "next";
import { tool } from "ai";
import { z } from "zod";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, "");
}

export function resolveAppBaseUrl(
  request: Request | NextApiRequest | string
): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (typeof request === "string") {
    return normalizeBaseUrl(request);
  }

  const req = request as NextApiRequest | Request;
  const headers = req.headers as
    | { get?: (name: string) => string | null }
    | Record<string, string | string[] | undefined>;

  if (typeof headers?.get === "function") {
    const webReq = req as Request;
    const requestUrl = new URL(webReq.url);
    const forwardedHost =
      headers.get("x-forwarded-host") ?? headers.get("host");
    if (forwardedHost) {
      const forwardedProto =
        headers.get("x-forwarded-proto") ??
        requestUrl.protocol.replace(":", "");
      return normalizeBaseUrl(`${forwardedProto}://${forwardedHost}`);
    }
    return normalizeBaseUrl(requestUrl.origin);
  }

  const host =
    (headers["x-forwarded-host"] as string) ??
    (Array.isArray(headers.host) ? headers.host[0] : headers.host);
  const proto =
    (headers["x-forwarded-proto"] as string) ??
    (headers["x-forwarded-ssl"] === "on" ? "https" : "http");
  if (host) {
    return normalizeBaseUrl(`${proto}://${host}`);
  }
  return "http://localhost:3000";
}

export function createTravelTools(baseUrl: string) {
  const appBaseUrl = normalizeBaseUrl(baseUrl);

  return {
    getWeather: tool({
      description:
        "Get weather forecast for a destination city. Use this when the user mentions a destination or when planning activities that depend on weather.",
      inputSchema: z.object({
        city: z.string().describe("City name (e.g., Tokyo, Paris, New York)"),
        country: z
          .string()
          .describe("Two-letter country code (e.g., JP, FR, US)"),
        days: z
          .number()
          .optional()
          .default(5)
          .describe("Number of forecast days (1-5)"),
      }),
      execute: async ({ city, country, days }) => {
        const res = await fetch(
          `${appBaseUrl}/api/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&days=${days}`
        );
        if (!res.ok) {
          return { error: "Failed to fetch weather data" };
        }
        return res.json();
      },
    }),

    getPlaceDetails: tool({
      description:
        "Search for places, attractions, restaurants, or hotels in a specific location. Returns ratings, photos, and addresses. Use this when recommending specific venues.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Search query (e.g., 'best sushi restaurants', 'Eiffel Tower', 'budget hotels')"
          ),
        location: z
          .string()
          .describe("City or area to search in (e.g., 'Tokyo', 'Paris')"),
      }),
      execute: async ({ query, location }) => {
        const res = await fetch(
          `${appBaseUrl}/api/places?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
        );
        if (!res.ok) {
          return { error: "Failed to fetch place details" };
        }
        return res.json();
      },
    }),

    getCurrencyRate: tool({
      description:
        "Get current exchange rate between two currencies. Use this when discussing budgets or costs in foreign destinations. IMPORTANT: Set the 'amount' parameter to the user's actual budget amount instead of defaulting to 1.",
      inputSchema: z.object({
        from: z
          .string()
          .describe("Source currency code (e.g., USD, EUR, GBP)"),
        to: z
          .string()
          .describe("Target currency code (e.g., JPY, THB, INR)"),
        amount: z
          .number()
          .optional()
          .default(1)
          .describe(
            "Amount to convert, use the user's actual budget if mentioned"
          ),
      }),
      execute: async ({ from, to, amount }) => {
        const res = await fetch(
          `${appBaseUrl}/api/currency?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amount}`
        );
        if (!res.ok) {
          return { error: "Failed to fetch currency rate" };
        }
        return res.json();
      },
    }),

    searchFlights: tool({
      description:
        "Search for available flights between two airports. Use this when the user asks about flights, or when you need to recommend flight options for their trip. Provide IATA airport codes for departure and arrival.",
      inputSchema: z.object({
        dep_iata: z
          .string()
          .describe(
            "Departure airport IATA code (e.g., DEL for Delhi, JFK for New York, LHR for London)"
          ),
        arr_iata: z
          .string()
          .describe(
            "Arrival airport IATA code (e.g., NRT for Tokyo Narita, CDG for Paris, SIN for Singapore)"
          ),
        date: z
          .string()
          .optional()
          .describe(
            "Flight date in YYYY-MM-DD format. Leave empty for today's flights."
          ),
      }),
      execute: async ({ dep_iata, arr_iata, date }) => {
        const params = new URLSearchParams({
          dep_iata,
          arr_iata,
        });

        if (date) params.set("date", date);

        const res = await fetch(`${appBaseUrl}/api/flights?${params.toString()}`);
        if (!res.ok) {
          return { error: "Failed to fetch flight data" };
        }
        return res.json();
      },
    }),
  };
}
