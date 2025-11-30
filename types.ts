export interface ChatRequest {
    query: string;
    top_k: number;
}

export interface Chunk {
    rank: number;
    score: number;
    text: string;
    metadata: {
        law?: string;
        chapter_number?: string;
        chapter_title?: string;
        section_number?: string;
        section_title?: string;
        [key: string]: any;
    };
}

export interface ChatResponse {
    query: string;
    answer: string;
    chunks: Chunk[];
    llm_model?: string;
}

export interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    chunks?: Chunk[];
    timestamp: number;
}
