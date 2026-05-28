"use client";

import React, { useState, useRef, useEffect } from "react";
import { FollowUpMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentFollowupChatProps {
  messages: FollowUpMessage[];
  isLoading: boolean;
  onSend: (question: string) => void;
  disabled?: boolean;
}

export function DocumentFollowupChat({
  messages,
  isLoading,
  onSend,
  disabled,
}: DocumentFollowupChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || isLoading) return;
    setInput("");
    onSend(q);
  };

  return (
    <div className="border border-border/50 rounded-xl bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <MessageSquare className="h-4 w-4 text-sidebar-primary" />
        <span className="text-sm font-medium text-foreground">
          Ask about this document
        </span>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/50 text-foreground"
                )}
              >
                {msg.role === "ai" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={isLoading || disabled}
            className="flex-1 bg-muted/30 border-border/50 focus-visible:ring-sidebar-primary/30"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || disabled}
            className="h-9 w-9 shrink-0 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
