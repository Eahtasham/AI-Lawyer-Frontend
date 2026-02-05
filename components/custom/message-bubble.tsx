"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { RetrievedChunks } from "./retrieved-chunks";
import { CouncilDeliberations } from "@/components/custom/council-deliberations";
import { motion } from "framer-motion";
import { FollowUpQuestions } from "./follow-up-questions";
import { Copy, RotateCcw, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    onFollowUpClick?: (question: string) => void;
    isLoading?: boolean;
}

export function MessageBubble({ message, onEdit, onRegenerate, onFollowUpClick, isLoading }: MessageBubbleProps) {
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
    
    const handleEditClick = () => {
        setIsEditing(true);
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
            className={cn(
                "group flex w-full px-0 py-4 gap-0",
                isAi ? "flex-row" : "flex-row-reverse"
            )}
        >
            <div className={cn(
                "flex flex-col min-w-0",
                isAi ? "items-start flex-1 w-full max-w-full" : "items-end",
                // Full width only when editing, otherwise constrained
                !isAi && !isEditing ? "max-w-[85%]" : "w-full"
            )}>
                <div className={cn(
                    "relative overflow-hidden break-words",
                    isAi ? "w-full pl-0" : cn(
                        "rounded-[20px] px-4 py-2.5",
                        isEditing 
                            ? "bg-[#f4f4f4] dark:bg-[#2f2f2f] border border-[#d1d1d1] dark:border-[#4a4a4a] w-full" 
                            : "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white max-w-full"
                    )
                )}>
                    {/* Council Deliberations (Shown above the answer) */}
                    {isAi && (
                        <CouncilDeliberations
                            opinions={message.council_opinions || []}
                            logs={message.logs}
                            isStreaming={message.isStreaming}
                        />
                    )}

                    {isEditing ? (
                        <div className="w-full">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[100px] w-full resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-base"
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
                        <div className={cn(
                            "prose prose-neutral max-w-none break-words",
                            isAi ? "dark:prose-invert" : "prose-invert" // White text for user messages
                        )}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{

                                    p: ({ children }) => <p className="mb-4 leading-7 last:mb-0">{children}</p>,
                                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 first:mt-0">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 first:mt-0">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h3>,
                                    h4: ({ children }) => <h4 className="text-base font-bold mt-4 mb-2">{children}</h4>,
                                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/20 pl-4 py-1 my-4 bg-muted/30 italic">{children}</blockquote>,
                                    hr: () => <hr className="my-6 border-gray-200 dark:border-gray-800" />,
                                    table: ({ children }) => <div className="my-4 w-full overflow-y-auto"><table className="w-full border-collapse border border-border">{children}</table></div>,
                                    th: ({ children }) => <th className="border border-border bg-muted px-4 py-2 text-left font-bold">{children}</th>,
                                    td: ({ children }) => <td className="border border-border px-4 py-2">{children}</td>,
                                    code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="rounded-md overflow-hidden my-6 border bg-zinc-950">
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
                                            <code {...props} className={cn(
                                                "px-1.5 py-0.5 rounded font-mono text-sm",
                                                isAi ? "bg-muted" : "bg-white/20",
                                                className
                                            )}>
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

                    {/* References */}
                    {!isEditing && isAi && showReferences && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                            <RetrievedChunks chunks={message.chunks!} />
                        </div>
                    )}

                    {/* Follow-up Questions */}
                    {!isEditing && isAi && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="mt-6 pt-2">
                             <FollowUpQuestions 
                                questions={message.followUpQuestions} 
                                onQuestionClick={(q) => onFollowUpClick && onFollowUpClick(q)}
                                disabled={isLoading} 
                             />
                        </div>
                    )}
                </div>

                {/* Actions - Outside the bubble - Always visible */}
                {!isEditing && (
                    <div className={cn(
                        "mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1",
                        isAi ? "justify-start" : "justify-end"
                    )}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                            title={isCopied ? "Copied" : "Copy"}
                        >
                            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>

                        {isAi && onRegenerate && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={onRegenerate}
                                title="Regenerate"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        )}

                        {!isAi && onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={handleEditClick}
                                title="Edit"
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
