import axios from "axios";

const toneInstructions = {
  Balanced:
    "Use a balanced tone: clear, practical, concise, and friendly.",
  Creative:
    "Use a creative tone: imaginative, polished, and engaging while staying useful.",
  Technical:
    "Use a technical tone: precise, structured, and implementation-focused."
};

export const generateAIResponse = async (messages, tone = "Balanced") => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const selectedTone = toneInstructions[tone] ? tone : "Balanced";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in backend/.env");
  }

  try {
    const recentMessages = messages.slice(-16);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        systemInstruction: {
          parts: [
            {
              text: `You are Nexus AI, a professional assistant for a portfolio chatbot app. ${toneInstructions[selectedTone]}`
            }
          ]
        },
        contents: recentMessages.map(({ role, content }) => ({
          role: role === "assistant" ? "model" : "user",
          parts: [
            {
              text: content
            }
          ]
        })),
        generationConfig: {
          temperature: selectedTone === "Creative" ? 0.9 : 0.6,
          topP: 0.95,
          maxOutputTokens: 1200
        }
      },
      {
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Gemini returned no text output");
    }

    return text;
  } catch (error) {
    const detail = error.response?.data?.error?.message || error.message;
    console.error("Gemini error:", detail);
    throw new Error("The assistant service is temporarily unavailable");
  }
};
