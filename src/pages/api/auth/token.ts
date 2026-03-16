/**
 * Auth Token API Route — Manages the HuggingFace access token cookie.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { HF_COOKIE_NAME } from "@/lib/auth";

function setCookieHeader(value: string, maxAge: number, secure: boolean) {
  const parts = [
    `${HF_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { access_token } = req.body as { access_token?: string };

      if (!access_token) {
        return res.status(400).json({ error: "Missing access_token" });
      }

      const maxAge = 60 * 60 * 24 * 30;
      const secure = process.env.NODE_ENV === "production";
      res.setHeader("Set-Cookie", setCookieHeader(access_token, maxAge, secure));
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: "Failed to set token" });
    }
  }

  if (req.method === "DELETE") {
    res.setHeader(
      "Set-Cookie",
      `${HF_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
