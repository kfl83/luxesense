import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Environment check
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    // 2. Parse request
    const body = await req.json();
    const { images = [], price, preferences = {} } = body;

    if (!images.length || !price) {
      return NextResponse.json(
        { error: "Images and price are required" },
        { status: 400 }
      );
    }

    // 3. LuxeSense system instruction (tone + rules)
    const systemPrompt = `
You are LuxeSense, a calm and professional luxury decision assistant.

Tone rules:
- Calm, respectful, non-judgmental
- No hype, no urgency, no exclamation marks
- Never persuasive or salesy
- Short, clear sentences

Recognition rules:
- Identify brand only if confidence is high
- Model identification must be general (e.g. "flap-style", "structured tote")
- Never claim authenticity
- Never claim rarity or investment value
- If unsure, clearly state limitations

Output structure (MANDATORY):
1. Verdict: Buy / Think Twice / Skip
2. Condition Summary (0–10 score + explanation)
3. Price Fairness: Underpriced / Fair / Overpriced
4. Explanation (plain language, recognition embedded naturally)
5. Confidence Notes / Caveats

Always remind users:
"It’s reasonable to pass and wait for a better option."
`;

    // 4. User prompt
    const userPrompt = `
User price: ${price}
User preferences: ${JSON.stringify(preferences)}

Analyze the bag based only on visible features in the images.
Focus on decision support, not certainty.
`;

    // 5. Build Gemini Vision request
    const geminiRequest = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: userPrompt },
            ...images.map((img: string) => ({
              inlineData: {
                mimeType: "image/jpeg",
                data: img.replace(/^data:image\/\w+;base64,/, "")
              }
            }))
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600
      }
    };

    // 6. Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiRequest)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate analysis.";

    // 7. Return clean response
    return NextResponse.json({
      success: true,
      analysis: text
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}