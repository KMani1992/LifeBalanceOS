import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const COACH_SYSTEM_PROMPT = `You are a calm and practical life assistant.

User daily reflection:
"{user_input}"

Give a very short response:

1. One positive observation
2. One small improvement suggestion for tomorrow

Keep it simple, practical, and encouraging.
Do not give long explanations.`;

/**
 * Generates reflection coaching hints using Gemini.
 */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    reflectionText?: string;
  };
  const reflectionText = body.reflectionText?.trim() ?? "";

  if (!reflectionText) {
    return NextResponse.json(
      { error: "Reflection text is required." },
      { status: 400 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${COACH_SYSTEM_PROMPT.replace("{user_input}", reflectionText)}\n\nReturn valid JSON only with keys: positiveObservation, improvementSuggestion.`,
    });

    const content = response.text?.trim() || "{}";
    let parsed: {
      positiveObservation?: string;
      improvementSuggestion?: string;
    } = {};

    try {
      parsed = JSON.parse(content) as {
        positiveObservation?: string;
        improvementSuggestion?: string;
      };
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      positiveObservation:
        parsed.positiveObservation ??
        "You stayed committed to your reflection habit.",
      improvementSuggestion:
        parsed.improvementSuggestion ??
        "Pick one specific action to improve tomorrow.",
    });
  } catch (error) {
    console.error("Reflection coach AI request failed", error);
    return NextResponse.json(
      { error: "Unable to generate coaching hints right now." },
      { status: 500 },
    );
  }
}
