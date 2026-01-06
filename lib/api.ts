import { ChatRequest, ChatResponse } from "@/types";

export async function fetchChatResponse(data: ChatRequest, token?: string, signal?: AbortSignal): Promise<ChatResponse> {
    console.log("Fetch Chat Token Debug:", token ? "Token present" : "Token MISSING");
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }


    return response.json();
}

export async function streamChatResponseWithFetch(
    query: string,
    onMessage: (type: string, payload: unknown) => void,
    token?: string,
    conversationId?: string,
    signal?: AbortSignal
): Promise<void> {
    let url = `/api/stream?query=${encodeURIComponent(query)}`;
    if (conversationId) {
        url += `&conversation_id=${encodeURIComponent(conversationId)}`;
    }
    
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: "GET",
        headers,
        signal,
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

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            
            // Keep the last part in buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                if (trimmedLine.startsWith("log:")) {
                    onMessage("log", trimmedLine.slice(4).trim());
                } else if (trimmedLine.startsWith("chunks:")) {
                    try {
                        const jsonStr = trimmedLine.slice(7);
                        const data = JSON.parse(jsonStr);
                        onMessage("chunks", data);
                    } catch (e) {
                        console.error("Failed to parse chunks. Raw:", trimmedLine, e);
                    }
                } else if (trimmedLine.startsWith("opinion:")) {
                    try {
                        const jsonStr = trimmedLine.slice(8);
                        const data = JSON.parse(jsonStr);
                        onMessage("opinion", data);
                    } catch (e) {
                        console.error("Failed to parse opinion. Raw:", trimmedLine, e);
                    }
                } else if (trimmedLine.startsWith("data:")) {
                    try {
                        const jsonStr = trimmedLine.slice(5);
                        const data = JSON.parse(jsonStr);
                        onMessage("data", data);
                    } catch (e) {
                        console.error("Failed to parse data. Raw:", trimmedLine, e);
                    }
                }
            }
        }
        
        // Process any remaining buffer
        if (buffer.trim()) {
             const trimmedLine = buffer.trim();
             if (trimmedLine.startsWith("data:")) {
                 try {
                     onMessage("data", JSON.parse(trimmedLine.slice(5)));
                 } catch (e) { console.error("Final buffer parse error:", trimmedLine); }
             }
        }

    } catch (e) {
        console.error("Stream reading error", e);
        throw e;
    }
}

export async function deleteConversation(conversationId: string, token: string): Promise<void> {
    const response = await fetch(`/api/chat/${conversationId}`, {
        method: "DELETE",
        headers: {
             "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
         throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
}
