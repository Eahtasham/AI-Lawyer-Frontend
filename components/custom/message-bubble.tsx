"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { RetrievedChunks } from "./retrieved-chunks";
import { CouncilDeliberations } from "@/components/custom/council-deliberations";
import { motion } from "framer-motion";
import { Copy, RotateCcw, User, Bot, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as SupabaseUser } from "@supabase/supabase-js";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MessageBubbleProps {
    message: Message;
    onEdit?: (newContent: string) => void;
    onRegenerate?: () => void;
    user?: SupabaseUser | null;
}

export function MessageBubble({ message, onEdit, onRegenerate, user }: MessageBubbleProps) {
    const isAi = message.role === "ai";
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    // Determine if query is non-legal based on Case Law Researcher's opinion
    const caseLawOpinion = message.council_opinions?.find(op => op.role === "Case Law Researcher");
    const isNonLegal = caseLawOpinion?.opinion?.includes("[[NON-LEGAL]]");
    // Show references only if NOT streaming AND NOT non-legal
    const showReferences = !message.isStreaming && !isNonLegal && message.chunks && message.chunks.length > 0;

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleSaveEdit = () => {
        if (onEdit && editContent.trim() !== message.content) {
            onEdit(editContent);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex w-full gap-4 px-4 py-2 md:gap-6 md:px-6 md:py-3"
        >
            <div className="flex flex-shrink-0 flex-col relative items-end">
                {isAi ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border shadow-sm bg-black text-white dark:bg-white dark:text-black border-transparent">
                        <Bot className="h-5 w-5" />
                    </div>
                ) : (
                    <Avatar className="h-8 w-8 border shadow-sm">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                         <AvatarFallback className="bg-white text-black border-gray-200">
                            {user?.email?.substring(0, 2).toUpperCase() || <User className="h-5 w-5" />}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>

            <div className="relative flex-1 overflow-hidden">
                {/* Council Deliberations (Shown above the answer) */}
                {isAi && (
                    <CouncilDeliberations
                        opinions={message.council_opinions || []}
                        logs={message.logs}
                        isStreaming={message.isStreaming}
                    />
                )}

                {isEditing ? (
                    <div className="rounded-md border bg-muted p-3">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px] w-full resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                            autoFocus
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                                <X className="mr-2 h-3 w-3" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                                <Check className="mr-2 h-3 w-3" /> Save & Submit
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-neutral dark:prose-invert max-w-none break-words">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{

                                code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="rounded-md overflow-hidden my-4 border bg-zinc-950">
                                            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                                                <span className="text-xs text-zinc-400 font-mono">{match[1]}</span>
                                                <Button variant="ghost" size="icon" className="h-4 w-4 text-zinc-400 hover:text-zinc-100" onClick={() => navigator.clipboard.writeText(String(children))}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code {...props} className={cn("bg-muted px-1.5 py-0.5 rounded font-mono text-sm", className)}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                {!isEditing && (
                    <div className={cn(
                        "mt-2 flex items-center gap-2 transition-opacity duration-200",
                        isAi ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                        {isAi && showReferences && <RetrievedChunks chunks={message.chunks!} />}

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                                title={isCopied ? "Copied" : "Copy"}
                            >
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>

                            {isAi && onRegenerate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={onRegenerate}
                                    title="Regenerate"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            )}

                            {!isAi && onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsEditing(true)}
                                    title="Edit"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
