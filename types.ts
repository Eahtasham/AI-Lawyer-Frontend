export interface ChatRequest {
    query: string;
    top_k: number;
    conversation_id?: string;
}

export interface Chunk {
    rank: number;
    score: number;
    text: string;
    metadata: {
        // Primary fields (unified format - always present)
        law?: string;
        chapter_number?: string;
        chapter_title?: string;
        section_number?: string;
        section_title?: string;
        // Extended fields (from new indian_kanoon structure)
        doc_id?: string;
        year?: string | number;
        act_id?: string;
        enactment_date?: string;
        source?: string;
        source_file?: string;
        chunk_index?: string | number;
        token_count?: string | number;
        // Catch-all for any additional fields
        [key: string]: string | number | boolean | undefined;
    };
}

export interface CouncilOpinion {
    role: string;
    model: string;
    opinion: string;
    web_search_enabled?: boolean;
}

export interface ChatResponse {
    query: string;
    answer: string;
    chunks: Chunk[];
    llm_model?: string;
    council_opinions?: CouncilOpinion[];
}

export interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    chunks?: Chunk[];
    council_opinions?: CouncilOpinion[];
    timestamp: number;
    logs?: string[];
    isStreaming?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
    isPinned?: boolean;
}
