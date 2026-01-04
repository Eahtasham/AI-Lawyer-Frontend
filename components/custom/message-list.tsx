"use client";

import { Message } from "@/types";
import { MessageBubble } from "./message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    onEdit: (messageId: string, newContent: string) => void;
    onRegenerate: () => void;
}

export function MessageList({ messages, isLoading, onEdit, onRegenerate }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
                {messages.map((message, index) => (
                    <MessageBubble 
                        key={message.id} 
                        message={message} 
                        onEdit={(newContent) => onEdit(message.id, newContent)}
                        onRegenerate={index === messages.length - 1 && message.role === "ai" ? onRegenerate : undefined}
                    />
                ))}
                {isLoading && (
                    <div className="flex w-full gap-4 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background shadow">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-[250px] animate-pulse rounded bg-muted" />
                            <div className="h-4 w-[200px] animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
        </div>
    );
}
