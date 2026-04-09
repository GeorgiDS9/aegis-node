export const queryAegisAI = async (prompt: string) => {
  try {
    const response = await fetch(`${process.env.OLLAMA_API}/api/generate`, {
      method: "POST",
      body: JSON.stringify({
        model: process.env.PRIMARY_MODEL,
        prompt: `[AEGIS_PROTOCOL] Analyze the following threat and suggest remediation: ${prompt}`,
        stream: false,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("🚨 Connection Error with Ollama on M4:", error);
    return { error: "AI Engine Offline - Ensure Ollama is running on Host" };
  }
};
