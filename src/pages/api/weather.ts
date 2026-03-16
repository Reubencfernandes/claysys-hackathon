/**
 * Weather API Route — Provides multi-day weather forecasts for a given city.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import type { WeatherForecast, DayForecast } from "@/lib/types";

function getMostFrequent(arr: string[]): string {
  const counts = new Map<string, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  let max = 0;
  let result = arr[0];
  for (const [item, count] of counts) {
    if (count > max) {
      max = count;
      result = item;
    }
  }
  return result;
}

function getMockWeather(
  city: string,
  country: string,
  days: number
): WeatherForecast {
  const today = new Date();
  const forecast: DayForecast[] = [];
  const conditions = [
    { description: "clear sky", icon: "01d" },
    { description: "few clouds", icon: "02d" },
    { description: "scattered clouds", icon: "03d" },
    { description: "light rain", icon: "10d" },
    { description: "clear sky", icon: "01d" },
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const condition = conditions[i % conditions.length];
    forecast.push({
      date: date.toISOString().split("T")[0],
      temp_min: 18 + Math.floor(Math.random() * 5),
      temp_max: 25 + Math.floor(Math.random() * 8),
      description: condition.description,
      icon: condition.icon,
      humidity: 50 + Math.floor(Math.random() * 30),
      wind_speed: 2 + Math.round(Math.random() * 5 * 10) / 10,
    });
  }

  return { city, country, forecast };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const city = req.query.city as string | undefined;
  const country = req.query.country as string | undefined;
  const days = parseInt((req.query.days as string) || "5");

  if (!city || !country) {
    return res.status(400).json({ error: "City and country are required" });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return res.status(200).json(getMockWeather(city, country, days));
  }

  try {
    const fetchRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},${encodeURIComponent(country)}&units=metric&cnt=${days * 8}&appid=${apiKey}`
    );

    if (!fetchRes.ok) {
      return res.status(200).json(getMockWeather(city, country, days));
    }

    const data = await fetchRes.json();
    const dailyMap = new Map<
      string,
      {
        temps: number[];
        descriptions: string[];
        icons: string[];
        humidities: number[];
        winds: number[];
      }
    >();

    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          temps: [],
          descriptions: [],
          icons: [],
          humidities: [],
          winds: [],
        });
      }
      const day = dailyMap.get(date)!;
      day.temps.push(item.main.temp);
      day.descriptions.push(item.weather[0].description);
      day.icons.push(item.weather[0].icon);
      day.humidities.push(item.main.humidity);
      day.winds.push(item.wind.speed);
    }

    const forecast: DayForecast[] = [];
    for (const [date, day] of dailyMap) {
      if (forecast.length >= days) break;
      forecast.push({
        date,
        temp_min: Math.round(Math.min(...day.temps)),
        temp_max: Math.round(Math.max(...day.temps)),
        description: getMostFrequent(day.descriptions),
        icon: getMostFrequent(day.icons),
        humidity: Math.round(
          day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length
        ),
        wind_speed:
          Math.round(
            (day.winds.reduce((a, b) => a + b, 0) / day.winds.length) * 10
          ) / 10,
      });
    }

    const result: WeatherForecast = {
      city: data.city.name,
      country: data.city.country,
      forecast,
    };

    return res.status(200).json(result);
  } catch {
    return res.status(200).json(getMockWeather(city, country, days));
  }
}
