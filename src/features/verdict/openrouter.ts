import "server-only";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Free by default. Benchmarked (Oct 2026) on the real verdict prompt:
 * Nemotron 3 Super returned valid JSON 6/6; Apodex is the backup when it's
 * rate-limited. Override with OPENROUTER_MODEL (comma-separated = fallback chain).
 */
const DEFAULT_MODELS = ["nvidia/nemotron-3-super-120b-a12b:free", "apodex/apodex-1.1-mini:free"];

/** Free reasoning models can take ~40s; leave headroom. */
const TIMEOUT_MS = 60_000;

function getModels(): string[] {
  const fromEnv = (process.env.OPENROUTER_MODEL ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_MODELS;
}

/** Primary model id (recorded alongside cached verdicts). */
export function getModelName(): string {
  return getModels()[0];
}

/**
 * Spend guard: refuse paid models unless explicitly allowed, so a typo'd or
 * copy-pasted model slug can never quietly start billing.
 */
function assertFreeOrAllowed(models: string[]) {
  if (process.env.OPENROUTER_ALLOW_PAID === "true") return;
  const paid = models.filter((m) => !m.endsWith(":free"));
  if (paid.length > 0) {
    throw new Error(
      `Paid model(s) blocked: ${paid.join(", ")}. Use ":free" models or set OPENROUTER_ALLOW_PAID="true".`
    );
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Calls OpenRouter's chat completions and returns the raw message content. */
export async function callOpenRouter(
  messages: ChatMessage[],
  options: { temperature: number }
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set. Add it to .env.local (see SETUP.md).");
  }

  const models = getModels();
  assertFreeOrAllowed(models);

  // One model → `model`; several → OpenRouter's `models` fallback routing
  // (it moves to the next one when a provider is rate-limited or down).
  const modelFields = models.length === 1 ? { model: models[0] } : { models };

  const post = (jsonMode: boolean) =>
    fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Draft Arena",
      },
      body: JSON.stringify({
        ...modelFields,
        temperature: options.temperature,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  // Prefer JSON mode; some (often free) models reject response_format — retry plain.
  let res = await post(true);
  if (!res.ok && (res.status === 400 || res.status === 404 || res.status === 422)) {
    res = await post(false);
  }
  if (res.status === 429) {
    throw new Error("OpenRouter rate limit (429) — free models are busy, try again shortly");
  }
  if (!res.ok) {
    throw new Error(`OpenRouter request failed (${res.status})`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response");
  return content;
}
