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
