// ---------------------------------------------------------------------------
// Shared Gemini helper — SERVER ONLY (import it from src/app/api/* only).
//
// Every AI route calls generateJSON(). It:
//   • asks Gemini for strict JSON that matches a JSON Schema
//   • optionally attaches a public YouTube video for Gemini to watch
//   • times out, and retries automatically when Gemini is busy (503/429)
//   • NEVER throws: on any problem it returns { data: null, error }, so the
//     route can fall back to its mock and the UI keeps rendering.
//
// Setup:  npm install @google/genai
// .env.local:
//   GEMINI_API_KEY=...            (from Google AI Studio)
//   GEMINI_MODEL=...              (optional — check AI Studio for the current
//                                  Flash model id; gemini-2.5-* is being retired)
// ---------------------------------------------------------------------------
import { GoogleGenAI } from "@google/genai";

const MODELS = (process.env.GEMINI_MODEL || "gemini-flash-latest")
  .split(",").map((m) => m.trim()).filter(Boolean);
const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 2;
const BACKOFF_MS = [2_000];

// 503 (busy), 429 (rate limit) and 500 are worth retrying; a 404 model name or
// a bad key is not — retrying those just wastes the demo's time.
const RETRYABLE = /\b(429|500|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|INTERNAL|high demand|overloaded|fetch failed|timed out/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export function geminiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Gemini sometimes wraps JSON in ```json fences even in JSON mode — strip them.
function parseJSON(text) {
  const clean = (text || "").replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean);
}

/**
 * @param {object}  opts
 * @param {string}  opts.prompt       Task instructions + data for the model.
 * @param {object}  opts.schema       JSON Schema the response must follow.
 * @param {string} [opts.system]      System instruction (role / rules).
 * @param {string} [opts.videoUrl]    Public YouTube URL for Gemini to watch.
 * @param {number} [opts.temperature] Default 0.2 — low, so scores are stable.
 * @param {number} [opts.timeoutMs]
 * @returns {Promise<{ data: any|null, error?: string, model?: string }>}
 */
export async function generateJSON({ prompt, schema, system, videoUrl, temperature = 0.2, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const ai = getClient();
  if (!ai) return { data: null, error: "GEMINI_API_KEY not set" };

  const parts = [];
  if (videoUrl) parts.push({ fileData: { fileUri: videoUrl } });
  parts.push({ text: prompt });

  let lastErr;
  for (const model of MODELS) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: {
            systemInstruction: system,
            temperature,
            responseMimeType: "application/json",
            responseJsonSchema: schema,
          },
        }),
        timeoutMs
      );
      return { data: parseJSON(res.text), model, attempts: attempt };
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      const retryable = RETRYABLE.test(msg);
      console.error(`[gemini] ${model} attempt ${attempt}/${MAX_ATTEMPTS} failed:`, msg.slice(0, 160));
      if (!retryable) break;
      if (attempt === MAX_ATTEMPTS) break;
      const wait = BACKOFF_MS[attempt - 1] ?? 2_000;
      console.error(`[gemini] retrying in ${wait / 1000}s…`);
      await sleep(wait);
    }
  }
  if (MODELS.length > 1) console.error(`[gemini] falling back from ${model}…`);
  }
  return { data: null, error: String(lastErr?.message || lastErr) };
}
