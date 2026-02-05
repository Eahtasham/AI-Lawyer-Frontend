"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, StopCircle, Paperclip, Mic, Globe, Cpu } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/lib/store/chat-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop?: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const contextWindowSize = useChatStore((state) => state.contextWindowSize);
    const setContextWindowSize = useChatStore((state) => state.setContextWindowSize);
    const webSearchEnabled = useChatStore((state) => state.webSearchEnabled);
    const setWebSearchEnabled = useChatStore((state) => state.setWebSearchEnabled);

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
        <div className="w-full relative pb-1 flex flex-col">
            {/* Toolbar Row */}
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2">
                    {/* Context Window Slider (Dropdown Menu) */}
                    <DropdownMenu>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-2 group cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors">
                                            <Cpu className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                                            <span className="text-xs font-medium text-muted-foreground w-4 text-center">{contextWindowSize}</span>
                                            <ChevronUp className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                        </div>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Context Memory (Click to adjust)</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent side="top" align="start" className="w-64 p-4 mb-2">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold">Context Window</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{contextWindowSize} turns</span>
                                </div>
                                <Slider
                                    value={[contextWindowSize]}
                                    onValueChange={(val) => setContextWindowSize(val[0])}
                                    min={1}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Adjusts how many past conversation turns (User + AI) the AI remembers.
                                </p>
                             </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-[1px] bg-border mx-1" />

                    {/* Search Toggle */}
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                        <Globe className={cn(
                                            "h-4 w-4 transition-colors",
                                            webSearchEnabled ? "text-primary" : "text-muted-foreground/70"
                                        )} />
                                        <Switch
                                            checked={webSearchEnabled}
                                            onCheckedChange={setWebSearchEnabled}
                                            className="scale-75 origin-left"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{webSearchEnabled ? "Web Search ON" : "Web Search OFF"}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Main Pill Container */}
            <div className="relative flex items-end gap-2 rounded-[26px] dark:bg-[var(--chat-surface)] border border-white/10 p-2 pl-4 shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors">



                {/* Attachment (Paperclip) - Left inside pill */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground/70 hover:text-foreground shrink-0 mb-1"
                            >
                                <Paperclip className="h-5 w-5" />
                                <span className="sr-only">Attach file</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Textarea */}
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className="flex-1 min-h-[24px] max-h-[200px] w-full resize-none border-0 bg-transparent py-2 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                    style={{ fontSize: '15px' }} // Match conversation history font size
                    rows={1}
                />

                {/* Right Actions */}
                <div className="flex items-center gap-1 mb-1 shrink-0">
                    {/* Voice (Mic) - Disabled - Right inside pill */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    className="h-8 w-8 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                                >
                                    <Mic className="h-5 w-5" />
                                    <span className="sr-only">Voice Input</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voice input (Coming soon)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

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
