"use client";

import { Message } from "@/types";
import { MessageBubble } from "./message-bubble";
import { useEffect, useRef } from "react";

import { User } from "@supabase/supabase-js";

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    onEdit: (messageId: string, newContent: string) => void;
    onRegenerate: (messageId?: string) => void;
    user: User | null;
    profile?: { username: string; full_name: string; avatar_url: string } | null;
}

export function MessageList({ messages, isLoading, onEdit, onRegenerate, user, profile }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-0 pb-10 pt-4 px-4">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onEdit={(newContent) => onEdit(message.id, newContent)}
                        onRegenerate={message.role === "ai" ? () => onRegenerate(message.id) : undefined}
                        user={user}
                        profile={profile}
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
