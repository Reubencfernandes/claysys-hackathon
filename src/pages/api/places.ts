/**
 * Places API Route — Searches for points of interest near a given location.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import type { PlacesResponse, PlaceResult } from "@/lib/types";

function getMockPlaces(query: string, location: string): PlacesResponse {
  const mockPlaces: PlaceResult[] = [
    {
      name: `${query} - Top Pick in ${location}`,
      address: `123 Main Street, ${location}`,
      rating: 4.5,
      user_ratings_total: 1250,
      photo_url: null,
      types: ["Tourist Attraction", "Point of Interest"],
      price_level: 2,
      location: { lat: 0, lng: 0 },
    },
    {
      name: `${query} - Popular Choice`,
      address: `456 Central Ave, ${location}`,
      rating: 4.3,
      user_ratings_total: 890,
      photo_url: null,
      types: ["Restaurant", "Food"],
      price_level: 2,
      location: { lat: 0, lng: 0 },
    },
    {
      name: `${query} - Hidden Gem`,
      address: `789 Side Street, ${location}`,
      rating: 4.7,
      user_ratings_total: 340,
      photo_url: null,
      types: ["Local Favorite"],
      price_level: 1,
      location: { lat: 0, lng: 0 },
    },
  ];

  return { places: mockPlaces, query, location };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = req.query.query as string | undefined;
  const location = req.query.location as string | undefined;

  if (!query || !location) {
    return res.status(400).json({ error: "Query and location are required" });
  }

  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) {
    return res.status(200).json(getMockPlaces(query, location));
  }

  try {
    const fetchRes = await fetch(
      `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&near=${encodeURIComponent(location)}&limit=5&fields=fsq_id,name,location,geocodes,categories,rating,popularity,price,photos,website`,
      {
        headers: {
          Authorization: apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!fetchRes.ok) {
      return res.status(200).json(getMockPlaces(query, location));
    }

    const data = await fetchRes.json();
    const places: PlaceResult[] = (data.results || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (place: any) => ({
        name: place.name || "",
        address:
          place.location?.formatted_address ||
          place.location?.address ||
          "",
        rating: place.rating ? place.rating / 2 : 0,
        user_ratings_total: place.popularity
          ? Math.round(place.popularity * 1000)
          : 0,
        photo_url: place.photos?.[0]
          ? `${place.photos[0].prefix}300x200${place.photos[0].suffix}`
          : null,
        types: (place.categories || [])
          .slice(0, 3)
          .map((c: { name: string }) => c.name),
        price_level: place.price ?? null,
        location: {
          lat: place.geocodes?.main?.latitude || 0,
          lng: place.geocodes?.main?.longitude || 0,
        },
      })
    );

    const result: PlacesResponse = { places, query, location };
    return res.status(200).json(result);
  } catch {
    return res.status(200).json(getMockPlaces(query, location));
  }
}
