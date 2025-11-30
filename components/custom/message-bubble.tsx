import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { RetrievedChunks } from "./retrieved-chunks";
import { motion } from "framer-motion";
import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isAi = message.role === "ai";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex w-full flex-col gap-2",
                isAi ? "items-start" : "items-end"
            )}
        >
            <div
                className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base",
                    isAi
                        ? "bg-transparent p-0 text-foreground"
                        : "bg-muted text-foreground"
                )}
            >
                <div className="prose prose-neutral dark:prose-invert max-w-none break-words">
                    <p className="whitespace-pre-wrap leading-7">{message.content}</p>
                </div>
            </div>

            {isAi && (
                <div className="flex w-full max-w-[85%] flex-col gap-2">
                    {message.chunks && <RetrievedChunks chunks={message.chunks} />}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Retry</span>
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
