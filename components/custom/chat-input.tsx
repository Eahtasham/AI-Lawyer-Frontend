"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, StopCircle, Plus, MessageSquarePlus, Image as ImageIcon, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop?: () => void;
    onNewChat?: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ChatInput({ onSend, onStop, onNewChat, isLoading, disabled }: ChatInputProps) {
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
        // Reset height on submit
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        adjustHeight();
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    return (
        <div className="w-full px-2 md:px-0 flex flex-col gap-1.5 bg-transparent">
            <div className="w-full flex items-end gap-2 rounded-3xl border border-white/10 bg-background/40 backdrop-blur-lg p-2 shadow-2xl ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1 focus-within:border-primary/30 transition-all">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full shrink-0 text-muted-foreground hover:bg-background/20 hover:text-foreground mb-0.5"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="sr-only">Add</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-48 mb-2">
                        <DropdownMenuItem onClick={onNewChat} className="cursor-pointer">
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            <span>New Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            <span>Photos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Files</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className="min-h-[24px] max-h-[200px] w-full resize-none border-0 bg-transparent p-2 focus:ring-0 focus-visible:ring-0 shadow-none text-base text-foreground placeholder:text-muted-foreground/50 [&::-webkit-scrollbar]:hidden"
                    rows={1}
                />

                {isLoading && onStop ? (
                    <Button
                        size="icon"
                        onClick={onStop}
                        className="h-9 w-9 rounded-full shrink-0 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 mb-0.5"
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
                            "h-9 w-9 rounded-full shrink-0 transition-all mb-0.5",
                             input.trim() && !isLoading && !disabled
                                ? "bg-white text-black hover:bg-white/90 shadow-sm" 
                                : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        )}
                    >
                        <SendHorizontal className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                )}
            </div>

            <p className="text-center text-[10px] text-muted-foreground/60 pointer-events-none select-none">
                 SamVidhaan can make mistakes. Consider checking important information.
            </p>
        </div>
    );
}
