// SP2-07 — Claude API client wrapper
// Thin wrapper: prompt in, text out. Error handling + retries via SDK.
// Used by batch generation script (Dev 1) and answer feedback (Dev 1 SP2-06).

import Anthropic from "@anthropic-ai/sdk";

const MODELS = {
  batch: "claude-sonnet-4-6",
  feedback: "claude-haiku-4-5-20251001",
} as const;

type ModelPreset = keyof typeof MODELS;

interface LLMOptions {
  model?: ModelPreset | string;
  maxTokens?: number;
  maxRetries?: number;
  timeout?: number;
}

function getClient(options?: Pick<LLMOptions, "maxRetries" | "timeout">) {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: options?.maxRetries ?? 3,
    timeout: options?.timeout ?? 30_000,
  });
}

function resolveModel(model?: ModelPreset | string): string {
  if (!model) return MODELS.batch;
  if (model in MODELS) return MODELS[model as ModelPreset];
  return model;
}

/**
 * Generate text from a prompt. Used by batch question generation (Dev 1).
 * Returns raw text — caller handles parsing and validation.
 */
export async function generateQuestions(
  prompt: string,
  options?: LLMOptions
): Promise<string> {
  const client = getClient({
    maxRetries: options?.maxRetries ?? 3,
    timeout: options?.timeout ?? 30_000,
  });

  const response = await client.messages.create({
    model: resolveModel(options?.model ?? "batch"),
    max_tokens: options?.maxTokens ?? 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error(`Unexpected response type: ${block.type}`);
  }
  return block.text;
}

/**
 * Generate feedback for a wrong answer. Used by answer API (Dev 1 SP2-06).
 * Returns a 2-3 sentence explanation in simplified English, or null on failure.
 * Never throws — LLM failure must not block the user's quiz flow.
 */
export async function generateFeedback(
  questionText: string,
  options: { key: string; text: string }[],
  correctOption: string,
  userAnswer: string,
  llmOptions?: LLMOptions
): Promise<string | null> {
  try {
    const client = getClient({
      maxRetries: llmOptions?.maxRetries ?? 1,
      timeout: llmOptions?.timeout ?? 10_000,
    });

    const prompt = `You are an AWS Cloud Practitioner tutor. A student answered a question wrong.

Question: ${questionText}
Options:
${options.map((o) => `${o.key}) ${o.text}`).join("\n")}
Correct answer: ${correctOption}
Student's answer: ${userAnswer}

Explain in 2-3 short sentences using simple English:
1. Why the correct answer is right
2. Why the student's choice was wrong

Be direct and helpful. No greetings or filler.`;

    const response = await client.messages.create({
      model: resolveModel(llmOptions?.model ?? "feedback"),
      max_tokens: llmOptions?.maxTokens ?? 256,
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content[0];
    if (block.type !== "text") return null;
    return block.text;
  } catch {
    // LLM failure is not fatal — save null and continue
    return null;
  }
}
