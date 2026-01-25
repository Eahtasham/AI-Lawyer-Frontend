"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, StopCircle, Plus } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop?: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!input.trim() || isLoading || disabled) return;
        onSend(input);
        setInput("");
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset to calculate
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);


    return (
        <div className="w-full relative pb-1">
            {/* Main Pill Container */}
            <div className="relative flex items-end gap-2 rounded-[26px] dark:bg-[var(--chat-surface)] border border-white/10 p-2 pl-4 shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors">

                {/* Plus Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground/70 hover:text-foreground shrink-0 mb-1"
                >
                    <Plus className="h-5 w-5 text-foreground" />
                </Button>

                {/* Textarea */}
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className="flex-1 min-h-[24px] max-h-[200px] w-full resize-none border-0 bg-transparent py-2 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                    rows={1}
                />

                {/* Right Actions */}
                <div className="flex items-center gap-1 mb-1 shrink-0">
                    {/* TODO: Add Mic/Voice functionality later, visual placeholder or functional if user wants */}
                    {/* 
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/70 hover:text-foreground">
                        <Mic className="h-5 w-5" />
                    </Button>
                     */}

                    {isLoading && onStop ? (
                        <Button
                            size="icon"
                            onClick={onStop}
                            className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all"
                        >
                            <StopCircle className="h-4 w-4 fill-current" />
                            <span className="sr-only">Stop</span>
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading || disabled}
                            className={cn(
                                "h-8 w-8 rounded-full transition-all",
                                input.trim() && !isLoading && !disabled
                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                            )}
                        >
                            <SendHorizontal className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    )}
                </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground/50">
                Samvidhaan can make mistakes. Check important info.
            </p>
        </div>
    );
}
