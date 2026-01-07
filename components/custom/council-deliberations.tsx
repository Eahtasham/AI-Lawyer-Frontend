"use client";

import { CouncilOpinion } from "@/types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, ShieldCheck, BookOpen, AlertTriangle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface CouncilDeliberationsProps {
    opinions: CouncilOpinion[];
    logs?: string[];
    isStreaming?: boolean;
}

export function CouncilDeliberations({ opinions, logs, isStreaming }: CouncilDeliberationsProps) {
    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if ((!opinions || opinions.length === 0) && (!logs || logs.length === 0)) return null;

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case "constitutional expert": return <Scale className="h-4 w-4" />;
            case "statutory analyst": return <ShieldCheck className="h-4 w-4" />;
            case "case law researcher": return <BookOpen className="h-4 w-4" />;
            case "devil's advocate": return <AlertTriangle className="h-4 w-4" />;
            default: return <Scale className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case "constitutional expert": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
            case "statutory analyst": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
            case "case law researcher": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
            case "devil's advocate": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
        }
    };

    return (
        <div className="w-full mb-4 space-y-2">

            {/* Live Logs Section - Visible while streaming or if logs exist */}
            {logs && logs.length > 0 && (
                <Accordion type="single" collapsible defaultValue={isStreaming ? "logs" : ""} className="w-full border rounded-lg bg-card/50 shadow-sm">
                    <AccordionItem value="logs" className="border-0">
                        <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50 transition-colors rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                    <Terminal className="h-4 w-4" />
                                    System Logs
                                </span>
                                {isStreaming && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                            <div className="bg-black/90 text-green-400 p-4 font-mono text-xs h-[150px] overflow-y-auto rounded-b-lg">
                                {logs.map((log, i) => (
                                    <div key={i} className="mb-1 border-b border-green-900/30 pb-1 last:border-0">
                                        <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}

            {/* Deliberations Section */}
            {opinions && opinions.length > 0 && (
                <Accordion type="single" collapsible className="w-full border rounded-lg bg-card/50 shadow-sm">
                    <AccordionItem value="deliberations" className="border-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    ⚖️ Council Deliberations
                                </span>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {opinions.length} Opinions
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                            <div className="grid gap-4 p-4 bg-muted/20">
                                {opinions.map((opinion, index) => (
                                    <div key={index} className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-center justify-between">
                                            <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium", getRoleColor(opinion.role))}>
                                                {getRoleIcon(opinion.role)}
                                                {opinion.role}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                                                {opinion.model}
                                            </span>
                                        </div>
                                        <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/30 p-3">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground/90 font-mono">
                                                {opinion.opinion}
                                            </p>
                                        </ScrollArea>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    );
}
