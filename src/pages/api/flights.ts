/**
 * Flights API Route — Looks up real flight information between two airports.
 */
import type { NextApiRequest, NextApiResponse } from "next";

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

export interface FlightsResponse {
  flights: FlightResult[];
  dep_city: string;
  arr_city: string;
  date: string;
  search_url?: string;
}

function getMockFlights(
  dep_iata: string,
  arr_iata: string,
  date: string
): FlightsResponse {
  const flightDate = date || new Date().toISOString().split("T")[0];
  return {
    flights: [],
    dep_city: dep_iata,
    arr_city: arr_iata,
    date: flightDate,
    search_url: `https://www.google.com/travel/flights?q=flights+from+${dep_iata}+to+${arr_iata}`,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const dep_iata = req.query.dep_iata as string | undefined;
  const arr_iata = req.query.arr_iata as string | undefined;
  const date = (req.query.date as string) || "";

  if (!dep_iata || !arr_iata) {
    return res
      .status(400)
      .json({ error: "Departure and arrival IATA codes are required" });
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    return res.status(200).json(getMockFlights(dep_iata, arr_iata, date));
  }

  try {
    const params = new URLSearchParams({
      access_key: apiKey,
      dep_iata,
      arr_iata,
      limit: "5",
    });
    if (date) params.set("flight_date", date);

    const fetchRes = await fetch(
      `https://api.aviationstack.com/v1/flights?${params.toString()}`
    );

    if (!fetchRes.ok) {
      return res.status(200).json(getMockFlights(dep_iata, arr_iata, date));
    }

    const data = await fetchRes.json();

    if (data.error) {
      return res.status(200).json(getMockFlights(dep_iata, arr_iata, date));
    }

    const flights: FlightResult[] = (data.data || []).slice(0, 5).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (f: any) => ({
        flight_date:
          f.flight_date ||
          date ||
          new Date().toISOString().split("T")[0],
        flight_status: f.flight_status || "scheduled",
        departure: {
          airport: f.departure?.airport || "",
          iata: f.departure?.iata || dep_iata,
          terminal: f.departure?.terminal || null,
          gate: f.departure?.gate || null,
          delay: f.departure?.delay || null,
          scheduled: f.departure?.scheduled || "",
        },
        arrival: {
          airport: f.arrival?.airport || "",
          iata: f.arrival?.iata || arr_iata,
          terminal: f.arrival?.terminal || null,
          gate: f.arrival?.gate || null,
          delay: f.arrival?.delay || null,
          scheduled: f.arrival?.scheduled || "",
        },
        airline: {
          name: f.airline?.name || "Unknown",
          iata: f.airline?.iata || "",
        },
        flight: {
          number: f.flight?.number || "",
          iata: f.flight?.iata || "",
        },
      })
    );

    const result: FlightsResponse = {
      flights,
      dep_city: dep_iata,
      arr_city: arr_iata,
      date: date || new Date().toISOString().split("T")[0],
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Flights fetch error:", err);
    return res.status(200).json(getMockFlights(dep_iata, arr_iata, date));
  }
}
