export async function ask(message: string, onChunk: (chunk: string) => void) {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:4b-instruct",
        messages: [{ role: "user", content: message }],
        stream: true
      })
    })

    if (!response.body) return

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Accumulate stream chunks into a buffer
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      // Process all complete lines, keeping any incomplete line in buffer
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        try {
          const json = JSON.parse(trimmed)
          if (json.message?.content) {
            onChunk(json.message.content)
          }
        } catch (e) {
          // Ignore invalid/partial lines without killing the stream loop!
          console.warn("Skipped incomplete JSON line:", trimmed)
        }
      }
    }
  } catch (err) {
    console.error("Ollama connection error:", err)
    onChunk("\nError: Could not connect to local Ollama server.")
  }
}