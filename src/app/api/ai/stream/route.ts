import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  const ollamaBase =
    process.env.OLLAMA_API_URL || process.env.OLLAMA_API || "http://localhost:11434";
  const model =
    process.env.OLLAMA_MODEL || process.env.PRIMARY_MODEL || "llama3:8b-instruct-q4_K_M";

  let ollamaResponse: Response;
  try {
    ollamaResponse = await fetch(`${ollamaBase}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `[AEGIS_PROTOCOL] ${prompt}`,
        stream: true,
      }),
    });
  } catch {
    return new Response("AI Engine Offline — Ensure Ollama is running on Host", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Transform Ollama's NDJSON stream into a plain text stream
  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaResponse.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n").filter(Boolean)) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                controller.enqueue(new TextEncoder().encode(parsed.response));
              }
            } catch {
              // skip malformed NDJSON lines
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
