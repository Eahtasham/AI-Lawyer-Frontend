"use client";

import { ChatInput } from "@/components/custom/chat-input";
import { MessageList } from "@/components/custom/message-list";
import { fetchChatResponse } from "@/lib/api";
import { Message } from "@/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Header } from "@/components/custom/header";

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (query: string) => {
        const userMessage: Message = {
            id: uuidv4(),
            role: "user",
            content: query,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetchChatResponse({ query, top_k: 5 });

            const aiMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: response.answer,
                chunks: response.chunks,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to fetch response:", error);
            const errorMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header />
            <main className="flex flex-1 flex-col overflow-hidden">
                {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                        <h2 className="text-2xl font-bold tracking-tight font-montserrat">
                            How can I help you today?
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Ask me about Indian laws, legal procedures, or draft documents.
                        </p>
                    </div>
                ) : (
                    <MessageList messages={messages} isLoading={isLoading} />
                )}
            </main>
            <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
    );
}
