"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="bg-background p-4 pt-2">
            <div className="mx-auto max-w-3xl">
                <div className="relative flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a legal question..."
                        className="min-h-[60px] w-full resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="mb-0.5 shrink-0 rounded-lg"
                    >
                        <SendHorizontal className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    AI Lawyer can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
}
