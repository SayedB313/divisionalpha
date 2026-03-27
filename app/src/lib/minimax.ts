// MiniMax 2.7 client — OpenAI-compatible API

const MINIMAX_API_URL = process.env.MINIMAX_API_URL || "https://api.minimax.io/v1";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.7";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MiniMaxOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: MiniMaxOptions = {}
): Promise<string> {
  const res = await fetch(`${MINIMAX_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.max_tokens ?? 1024,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`MiniMax API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  // Strip MiniMax reasoning traces (<think>...</think>)
  return content.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

// Streaming version for Coach real-time responses
export async function chatCompletionStream(
  messages: ChatMessage[],
  options: MiniMaxOptions = {}
): Promise<ReadableStream> {
  const res = await fetch(`${MINIMAX_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.max_tokens ?? 1024,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`MiniMax API error ${res.status}: ${errText}`);
  }

  return res.body!;
}
