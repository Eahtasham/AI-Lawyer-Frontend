"use client";

import { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface FollowUpQuestionsProps {
    questions: string[];
    onQuestionClick: (question: string) => void;
    className?: string;
}

export function FollowUpQuestions({ questions, onQuestionClick, className }: FollowUpQuestionsProps) {
    if (!questions || questions.length === 0) return null;

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground font-medium">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                <span>Suggested Follow-ups</span>
            </div>
            <div className="flex flex-col gap-2">
                {questions.map((question, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-2.5 px-4 text-left whitespace-normal h-auto hover:bg-muted/50 border-muted-foreground/20 text-sm font-normal transition-colors"
                            onClick={() => onQuestionClick(question)}
                        >
                            <span className="line-clamp-2">{question}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 ml-2 opacity-50" />
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
