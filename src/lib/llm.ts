"use server";

// SP2-07 — Claude API client wrapper
// Thin wrapper: prompt in, text out. Error handling + retries via SDK.
// Used by batch generation script (Dev 1) and answer feedback (Dev 1 SP2-06).
// SECURITY: "use server" prevents accidental client-side import (would leak ANTHROPIC_API_KEY).

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
  options?: LLMOptions,
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
 * V2-01 — Socratic Feedback System
 * Feedback style adapts based on user level:
 *   - Beginner (levels 1-3): Simplified English, direct explanations
 *   - Intermediate (levels 4-6): Mix of explanation + one guiding question
 *   - Advanced (levels 7+): Technical English, Socratic questioning
 *
 * Returns a 2-3 sentence explanation, or null on failure.
 * Never throws — LLM failure must not block the user's quiz flow.
 */
import { getFeedbackLevel, type FeedbackLevel } from "@/lib/feedback-level";

function buildFeedbackPrompt(
  questionText: string,
  options: { key: string; text: string }[],
  correctOption: string,
  userAnswer: string,
  feedbackLevel: FeedbackLevel,
  explanation?: string,
): string {
  const optionsBlock = options.map((o) => `${o.key}) ${o.text}`).join("\n");

  const styleInstructions: Record<FeedbackLevel, string> = {
    beginner: explanation
      ? `Existing explanation: ${explanation}\n\nThe student is a beginner. Using simplified English (short words, simple sentences), explain in 2-3 sentences why their specific choice was wrong and what they should remember. Do not repeat the existing explanation — add something new and specific to their wrong choice.`
      : `The student is a beginner. Explain in 2-3 short sentences using simple, everyday English why the correct answer is right and why the student's choice was wrong.`,

    intermediate: explanation
      ? `Existing explanation: ${explanation}\n\nThe student has some experience. In 2-3 sentences, explain why their choice was wrong using proper AWS terminology. End with one thought-provoking question that helps them think deeper about the concept (e.g., "What would happen if...?" or "How does this relate to...?"). Do not repeat the existing explanation.`
      : `The student has some experience. In 2-3 sentences, explain why the correct answer is right using proper AWS terminology. End with one thought-provoking question that helps them connect this concept to broader AWS knowledge.`,

    advanced: explanation
      ? `Existing explanation: ${explanation}\n\nThe student is advanced. Do NOT just explain the answer. Instead, use the Socratic method: ask 2-3 targeted questions that guide the student to understand WHY their choice was wrong and discover the correct reasoning themselves. Use technical AWS language. Reference real-world scenarios or architectural trade-offs where relevant. Do not repeat the existing explanation.`
      : `The student is advanced. Do NOT just explain the answer. Instead, use the Socratic method: ask 2-3 targeted questions that lead the student to reason through why the correct answer is right. Use technical AWS language. Reference real-world scenarios or architectural trade-offs.`,
  };

  const roleByLevel: Record<FeedbackLevel, string> = {
    beginner: "You are a patient AWS Cloud Practitioner tutor for beginners.",
    intermediate: "You are an AWS Cloud Practitioner tutor for intermediate learners.",
    advanced: "You are a senior AWS architect mentoring an advanced student using the Socratic method.",
  };

  return `${roleByLevel[feedbackLevel]} A student answered a question wrong.

Question: ${questionText}
Options:
${optionsBlock}
Correct answer: ${correctOption}
Student's answer: ${userAnswer}

${styleInstructions[feedbackLevel]}

Be direct and helpful. No greetings or filler.`;
}

export async function generateFeedback(
  questionText: string,
  options: { key: string; text: string }[],
  correctOption: string,
  userAnswer: string,
  explanation?: string,
  llmOptions?: LLMOptions,
  userLevel?: number,
): Promise<string | null> {
  try {
    const client = getClient({
      maxRetries: llmOptions?.maxRetries ?? 1,
      timeout: llmOptions?.timeout ?? 10_000,
    });

    const feedbackLevel = getFeedbackLevel(userLevel ?? 1);
    const prompt = buildFeedbackPrompt(
      questionText,
      options,
      correctOption,
      userAnswer,
      feedbackLevel,
      explanation,
    );

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
