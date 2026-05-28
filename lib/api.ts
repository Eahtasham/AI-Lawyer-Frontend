import { ChatRequest, ChatResponse, AnalysisItem } from "@/types";

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
    contextWindow?: number,
    webSearch?: boolean,
    mode?: 'fast' | 'balanced' | 'research',
    signal?: AbortSignal
): Promise<void> {
    let url = `/api/stream?query=${encodeURIComponent(query)}`;
    if (conversationId) {
        url += `&conversation_id=${encodeURIComponent(conversationId)}`;
    }
    if (contextWindow) {
        url += `&context_window=${contextWindow}`;
    }
    if (webSearch === true || String(webSearch) === 'true') {
        url += `&web_search=true`;
    } else {
        url += `&web_search=false`;
    }
    if (mode) {
        url += `&mode=${mode}`;
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

                } else if (trimmedLine.startsWith("token:")) {
                     try {
                        const jsonStr = trimmedLine.slice(6);
                        const token = JSON.parse(jsonStr);
                        onMessage("token", token);
                     } catch (e) {
                         console.error("Failed to parse token. Raw:", trimmedLine, e);
                     }
                } else if (trimmedLine.startsWith("followup:")) {
                     try {
                        const jsonStr = trimmedLine.slice(9);
                        const data = JSON.parse(jsonStr);
                        onMessage("followup", data);
                     } catch (e) {
                         console.error("Failed to parse followup. Raw:", trimmedLine, e);
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
                } catch (_e) { console.error("Final buffer parse error:", trimmedLine); }
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

// --- Document Analyzer API ---

export async function uploadDocument(
    file: File,
    token: string,
): Promise<{ analysis_id: string; file_name: string; file_type: string; file_size: number; text_length: number; status: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/document/upload", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `Upload failed: ${response.statusText}`);
    }

    return response.json();
}

export async function streamAnalysis(
    analysisId: string,
    onMessage: (type: string, payload: unknown) => void,
    token: string,
    signal?: AbortSignal,
): Promise<void> {
    const url = `/api/document/analyze/${analysisId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
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
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                if (trimmedLine.startsWith("log:")) {
                    onMessage("log", trimmedLine.slice(4).trim());
                } else if (trimmedLine.startsWith("section:")) {
                    try {
                        onMessage("section", JSON.parse(trimmedLine.slice(8)));
                    } catch (e) {
                        console.error("Failed to parse section:", trimmedLine, e);
                    }
                } else if (trimmedLine.startsWith("chunks:")) {
                    try {
                        onMessage("chunks", JSON.parse(trimmedLine.slice(7)));
                    } catch (e) {
                        console.error("Failed to parse chunks:", trimmedLine, e);
                    }
                } else if (trimmedLine.startsWith("done:")) {
                    try {
                        onMessage("done", JSON.parse(trimmedLine.slice(5)));
                    } catch (e) {
                        console.error("Failed to parse done:", trimmedLine, e);
                    }
                } else if (trimmedLine.startsWith("data:")) {
                    try {
                        onMessage("data", JSON.parse(trimmedLine.slice(5)));
                    } catch (e) {
                        console.error("Failed to parse data:", trimmedLine, e);
                    }
                }
            }
        }
    } catch (e) {
        if (signal?.aborted) return;
        console.error("Analysis stream error", e);
        throw e;
    }
}

export async function fetchAnalyses(token: string): Promise<AnalysisItem[]> {
    const response = await fetch("/api/document/analyses", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch analyses");
    const data = await response.json();
    return data.analyses || [];
}

export async function fetchAnalysis(analysisId: string, token: string) {
    const response = await fetch(`/api/document/${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch analysis");
    return response.json();
}

export async function deleteAnalysis(analysisId: string, token: string): Promise<void> {
    const response = await fetch(`/api/document/${analysisId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete analysis");
}

export async function streamFollowUp(
    analysisId: string,
    question: string,
    onMessage: (type: string, payload: unknown) => void,
    token: string,
    signal?: AbortSignal,
): Promise<void> {
    const url = `/api/document/${analysisId}/followup?question=${encodeURIComponent(question)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal,
    });

    if (!response.ok) throw new Error(`Follow-up failed: ${response.statusText}`);
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                if (trimmedLine.startsWith("token:")) {
                    try {
                        onMessage("token", JSON.parse(trimmedLine.slice(6)));
                    } catch (e) {
                        console.error("Failed to parse token:", e);
                    }
                } else if (trimmedLine.startsWith("data:")) {
                    try {
                        onMessage("data", JSON.parse(trimmedLine.slice(5)));
                    } catch (e) {
                        console.error("Failed to parse data:", e);
                    }
                }
            }
        }
    } catch (e) {
        if (signal?.aborted) return;
        throw e;
    }
}
