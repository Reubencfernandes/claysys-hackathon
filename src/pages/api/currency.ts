/**
 * Currency API Route — Converts an amount between two currencies.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import type { CurrencyRate } from "@/lib/types";

function getMockRate(from: string, to: string, amount: number): CurrencyRate {
  const mockRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    INR: 83.1,
    THB: 35.2,
    AUD: 1.53,
    CAD: 1.36,
    SGD: 1.34,
    MYR: 4.72,
    KRW: 1320,
    CNY: 7.24,
    BRL: 4.97,
    MXN: 17.15,
    CHF: 0.88,
    NZD: 1.63,
    SEK: 10.42,
    NOK: 10.55,
    DKK: 6.87,
    ZAR: 18.65,
    AED: 3.67,
    HKD: 7.82,
    TWD: 31.5,
    PHP: 55.8,
    IDR: 15650,
    VND: 24350,
  };

  const fromRate = mockRates[from] || 1;
  const toRate = mockRates[to] || 1;
  const rate = toRate / fromRate;
  const convertedAmount = Math.round(amount * rate * 100) / 100;

  return {
    from,
    to,
    rate: Math.round(rate * 10000) / 10000,
    amount,
    converted_amount: convertedAmount,
    last_updated: new Date().toISOString(),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const from = (req.query.from as string)?.toUpperCase();
  const to = (req.query.to as string)?.toUpperCase();
  const amount = parseFloat((req.query.amount as string) || "1");

  if (!from || !to) {
    return res
      .status(400)
      .json({ error: "From and to currency codes are required" });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    return res.status(200).json(getMockRate(from, to, amount));
  }

  try {
    const fetchRes = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`
    );

    if (!fetchRes.ok) {
      return res.status(200).json(getMockRate(from, to, amount));
    }

    const data = await fetchRes.json();

    const result: CurrencyRate = {
      from,
      to,
      rate: data.conversion_rate,
      amount,
      converted_amount: data.conversion_result,
      last_updated: data.time_last_update_utc || new Date().toISOString(),
    };

    return res.status(200).json(result);
  } catch {
    return res.status(200).json(getMockRate(from, to, amount));
  }
}
