/**
 * Chat API Route — The core conversational endpoint for the travel assistant.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createTravelTools, resolveAppBaseUrl } from "@/lib/ai/tools";
import { getSystemPrompt } from "@/lib/ai/system-prompt";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body as { messages: unknown[] };

    const hfToken = req.cookies?.hf_access_token;

    if (!hfToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const huggingface = createOpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: hfToken,
    });

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const baseUrl = resolveAppBaseUrl(req);

    const result = streamText({
      model: huggingface.chat("Qwen/Qwen3.5-397B-A17B:together"),
      maxOutputTokens: 16384,
      system: getSystemPrompt(currentDate),
      messages: await convertToModelMessages(messages),
      tools: createTravelTools(baseUrl),
      stopWhen: stepCountIs(10),
    });

    const response = result.toUIMessageStreamResponse();
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as unknown as ReadableStream
      );
      await new Promise<void>((resolve, reject) => {
        nodeStream.pipe(res);
        nodeStream.on("error", reject);
        res.on("finish", resolve);
        res.on("error", reject);
      });
    } else {
      res.end();
    }
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
}
