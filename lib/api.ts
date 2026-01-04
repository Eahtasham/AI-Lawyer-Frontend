import { ChatRequest, ChatResponse } from "@/types";

export async function fetchChatResponse(data: ChatRequest): Promise<ChatResponse> {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }


    return response.json();
}

export async function streamChatResponseWithFetch(
    query: string,
    onMessage: (type: string, payload: unknown) => void
): Promise<void> {
    const response = await fetch(`/api/stream?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    if (!response.body) {
        throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last part in buffer if it's incomplete
        // (If the stream ended, split will produce an empty string at the end if it ended with \n, 
        // or the last chunk if not. However, usually SSE streams end with double newline or similar. 
        // Logic: Process all complete lines. If the last segment doesn't end with a newline, it might be incomplete.)

        // Actually, simpler logic:
        // `split` gives ["line1", "line2", "partial"] or ["line1", "", ""] if ends with \n\n
        // We'll process all except the last one, and set buffer to the last one.

        buffer = lines.pop() || "";

        for (const line of lines) {
            if (!line.trim()) continue;

            if (line.startsWith("log:")) {
                onMessage("log", line.slice(4).trim());
            } else if (line.startsWith("chunks:")) {
                try {
                    const data = JSON.parse(line.slice(7));
                    onMessage("chunks", data);
                } catch (e) {
                    console.error("Failed to parse chunks", e);
                }
            } else if (line.startsWith("opinion:")) {
                try {
                    const data = JSON.parse(line.slice(8));
                    onMessage("opinion", data);
                } catch (e) {
                    console.error("Failed to parse opinion", e);
                }
            } else if (line.startsWith("data:")) {
                try {
                    const data = JSON.parse(line.slice(5));
                    onMessage("data", data);
                } catch (e) {
                    console.error("Failed to parse data", e);
                }
            }
        }
    }

    // Process remaining buffer if any (unlikely if backend ends nicely, but good for robustness)
    if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith("log:")) {
            onMessage("log", line.slice(4).trim());
        } else if (line.startsWith("chunks:")) {
            try { onMessage("chunks", JSON.parse(line.slice(7))); } catch { }
        } else if (line.startsWith("opinion:")) {
            try { onMessage("opinion", JSON.parse(line.slice(8))); } catch { }
        } else if (line.startsWith("data:")) {
            try { onMessage("data", JSON.parse(line.slice(5))); } catch { }
        }
    }
}
