/**
 * Shared TypeScript type definitions for the travel planning app.
 *
 * These interfaces define the shape of data returned by the external API
 * endpoints (weather, places, currency, flights). They are used both by
 * the API route handlers that fetch data from third-party services and
 * by the frontend components that render tool-call results in the chat UI.
 */

// --- Weather Types ---

/** A single day's weather forecast for a destination city. */
export interface DayForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

/** Multi-day weather forecast response, grouped by city. */
export interface WeatherForecast {
  city: string;
  country: string;
  forecast: DayForecast[];
}

// --- Places / Points of Interest Types ---

/** A single place result (restaurant, hotel, attraction, etc.) from the places API. */
export interface PlaceResult {
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  photo_url: string | null;
  types: string[];
  price_level: number | null;
  /** Lat/lng coordinates used to generate Google Maps links in the itinerary. */
  location: { lat: number; lng: number };
}

/** Wraps an array of place results along with the original search context. */
export interface PlacesResponse {
  places: PlaceResult[];
  query: string;
  location: string;
}

// --- Currency Conversion Types ---

/** Exchange rate result including the converted amount for budget planning. */
export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  amount: number;
  converted_amount: number;
  last_updated: string;
}

// --- Flight Search Types ---

/** A single flight result with departure/arrival details and airline info. */
export interface FlightResult {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    iata: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
  };
}

/** Wraps flight search results with route and date context. */
export interface FlightsResponse {
  flights: FlightResult[];
  dep_city: string;
  arr_city: string;
  date: string;
}
