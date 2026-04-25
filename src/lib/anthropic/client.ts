import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null = null;

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }

  return cachedClient;
}

export function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-latest";
}

export function canUseAnthropic() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

