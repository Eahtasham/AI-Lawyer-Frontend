import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { RetrievedChunks } from "./retrieved-chunks";
import { motion } from "framer-motion";
import { Copy, RotateCcw, User, Bot, Pencil, Check, X } from "lucide-react";
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
}

export function MessageBubble({ message, onEdit, onRegenerate }: MessageBubbleProps) {
    const isAi = message.role === "ai";
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
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
            className="group flex w-full gap-4 p-4 md:gap-6 md:p-6"
        >
            <div className="flex flex-shrink-0 flex-col relative items-end">
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border shadow-sm",
                    isAi ? "bg-black text-white dark:bg-white dark:text-black border-transparent" : "bg-white text-black border-gray-200"
                )}>
                    {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
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
                                code({ node, inline, className, children, ...props }: any) {
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
                                                {...props}
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
                        {isAi && message.chunks && <RetrievedChunks chunks={message.chunks} />}
                        
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                                title="Copy"
                            >
                                <Copy className="h-4 w-4" />
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
