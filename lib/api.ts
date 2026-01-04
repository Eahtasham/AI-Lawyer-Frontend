import { ChatRequest, ChatResponse } from "@/types";

export async function fetchChatResponse(data: ChatRequest, token?: string): Promise<ChatResponse> {
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
    conversationId?: string
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
