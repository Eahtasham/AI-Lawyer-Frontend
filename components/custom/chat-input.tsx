"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
        <div className="w-full relative px-4 pb-4">
            <div className="relative flex flex-col gap-2 rounded-2xl border border-input bg-card p-3 shadow-lg ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a legal question..."
                    className="min-h-[50px] max-h-[200px] w-full resize-none border-0 bg-transparent p-1 focus:ring-0 focus-visible:ring-0 shadow-none text-base"
                    disabled={isLoading}
                    rows={1}
                />
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-muted-foreground ml-1">
                        AI Lawyer
                    </span>
                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className={cn("h-8 w-8 rounded-lg transition-all", input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                    >
                        <SendHorizontal className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground/60">
                 AI Lawyer can make mistakes. Consider checking important information.
            </p>
        </div>
    );
}
