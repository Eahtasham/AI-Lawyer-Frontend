import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Chunk } from "@/types";
import { BookOpen, Scale, Gavel, FileText, Calendar, Building2, Download, Loader2, User, Hash, FileType } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetrievedChunksProps {
    chunks: Chunk[];
}

import { useState } from "react";

export function RetrievedChunks({ chunks }: RetrievedChunksProps) {
    const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
    const [downloadTimeLeft, setDownloadTimeLeft] = useState<number | null>(null);

    const handleDownload = async (url: string) => {
        if (!url) return;
        setDownloadingUrl(url);
        setDownloadTimeLeft(56); // Start UX timer at 56s

        // Timer interval
        const timer = setInterval(() => {
            setDownloadTimeLeft((prev) => {
                if (prev === null || prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);

        try {
            const response = await fetch(`/api/download-judgement?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                console.log("Download started successfully");

                // Get the blob from the response
                const blob = await response.blob();

                // Create a temporary URL for the blob
                const downloadUrl = window.URL.createObjectURL(blob);

                // Create a temporary anchor element
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;

                // Get filename from Content-Disposition header if available, otherwise fallback
                const disposition = response.headers.get('Content-Disposition');
                let filename = 'judgement.pdf';
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                a.download = filename;

                // Append to body, click, and remove
                document.body.appendChild(a);
                a.click();

                // Cleanup
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(a);
            } else {
                console.error(`[Download] Failed to start download. Status: ${response.status} ${response.statusText}`);
                try {
                    const errorText = await response.text();
                    console.error(`[Download] Error details: ${errorText}`);
                } catch (e) { console.error("[Download] Could not read error text", e); }
            }
        } catch (error) {
            console.error("[Download] Network/Handler error:", error);
        } finally {
            clearInterval(timer);
            setDownloadingUrl(null);
            setDownloadTimeLeft(null);
        }
    };

    if (!chunks || chunks.length === 0) return null;

    // Categorize chunks
    const statuteChunks = chunks.filter(chunk => {
        const collection = String(chunk.metadata?.collection || chunk.metadata?.source_type || "");
        return collection.toLowerCase().includes("statute") ||
            collection.toLowerCase().includes("legal_docs") ||
            collection.toLowerCase().includes("indian_legal");
    });

    const caseChunks = chunks.filter(chunk => {
        const collection = String(chunk.metadata?.collection || chunk.metadata?.source_type || "");
        return collection.toLowerCase().includes("case") ||
            collection.toLowerCase().includes("court");
    });

    const finalStatuteChunks = statuteChunks.length > 0 ? statuteChunks : (caseChunks.length === 0 ? chunks : []);
    const finalCaseChunks = caseChunks;

    const renderChunk = (chunk: Chunk, index: number, type: 'statute' | 'case') => {
        const borderColor = type === 'statute'
            ? "border-amber-200 dark:border-amber-900/50"
            : "border-indigo-200 dark:border-indigo-900/50";

        const bgColor = type === 'statute'
            ? "bg-amber-50/50 dark:bg-amber-950/10"
            : "bg-indigo-50/50 dark:bg-indigo-950/10";

        const iconColor = type === 'statute' ? "text-amber-600 dark:text-amber-500" : "text-indigo-600 dark:text-indigo-400";

        return (
            <div
                key={index}
                className={cn(
                    "flex flex-col gap-2 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md",
                    borderColor,
                    bgColor
                )}
            >
                {/* Header */}
                <div className="flex flex-col gap-1.5 border-b border-border/50 pb-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                            {type === 'statute' ? (
                                <>
                                    <h4 className="font-semibold text-sm text-foreground/90 leading-tight">
                                        {chunk.metadata?.law || "Unknown Statute"}
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {(chunk.metadata?.section_number || chunk.metadata?.section_title) && (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                                                {chunk.metadata.section_number ? `Section ${chunk.metadata.section_number}` : chunk.metadata.section_title}
                                            </Badge>
                                        )}
                                        {chunk.metadata?.year && (
                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Calendar className="h-3 w-3" /> {chunk.metadata.year}
                                            </span>
                                        )}
                                        {chunk.metadata?.act_id && (
                                            <span className="flex items-center gap-1 text-[10px] text-amber-600/70 font-mono" title="Act ID">
                                                <Hash className="h-3 w-3" /> {chunk.metadata.act_id}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h4 className="font-semibold text-sm text-foreground/90 leading-tight">
                                        {chunk.metadata?.case_name || "Unknown Case"}
                                    </h4>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex flex-wrap gap-1.5">
                                            {chunk.metadata?.court && (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400">
                                                    <Building2 className="h-3 w-3 mr-1" />
                                                    {chunk.metadata.court}
                                                </Badge>
                                            )}
                                            {chunk.metadata?.date && (
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3" /> {chunk.metadata.date}
                                                </span>
                                            )}
                                            {chunk.metadata?.case_type && (
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <FileType className="h-3 w-3" /> {chunk.metadata.case_type}
                                                </span>
                                            )}
                                            {chunk.metadata?.case_number && (
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                                    <Hash className="h-3 w-3" /> {chunk.metadata.case_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        {chunk.score && (
                            <span className={cn("text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-background/50 border shadow-sm", borderColor, iconColor)}>
                                {Math.round(chunk.score * 100)}% Match
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[200px] w-full rounded-md border bg-background/50 p-3 mt-1">
                    <p className="text-sm text-muted-foreground/90 leading-relaxed font-serif">
                        {chunk.text}
                    </p>
                </ScrollArea>

                {/* Case Actions */}
                {type === 'case' && chunk.metadata?.url && (
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => handleDownload(chunk.metadata!.url!)}
                            disabled={downloadingUrl === chunk.metadata.url}
                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            {downloadingUrl === chunk.metadata.url ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            {downloadingUrl === chunk.metadata.url
                                ? `Downloading... (${downloadTimeLeft}s)`
                                : "Download Original SC Judgement"}
                        </button>
                    </div>
                )}

                {/* Footer Metadata */}
                {chunk.metadata && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                        {type === 'statute' && chunk.metadata.chapter_title && (
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Chapter: {chunk.metadata.chapter_title}
                            </span>
                        )}
                        {/* Add more generic metadata if needed */}
                        <span className="opacity-50">Source {index + 1}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-2 w-full">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sources" className="border rounded-lg bg-card shadow-sm overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>Cited References</span>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                {chunks.length}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <Tabs defaultValue={finalStatuteChunks.length > 0 ? "statutes" : "cases"} className="w-full">
                            <TabsList className="w-full rounded-none border-b bg-muted/30 p-0 h-10 gap-0">
                                <TabsTrigger
                                    value="statutes"
                                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:bg-amber-50/50 dark:data-[state=active]:bg-amber-950/20 h-full gap-2 transition-all duration-200"
                                >
                                    <Scale className="h-3.5 w-3.5" />
                                    Statutes & Constitution
                                    {finalStatuteChunks.length > 0 && (
                                        <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px] bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                            {finalStatuteChunks.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cases"
                                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-indigo-50/50 dark:data-[state=active]:bg-indigo-950/20 h-full gap-2 transition-all duration-200"
                                >
                                    <Gavel className="h-3.5 w-3.5" />
                                    Case Law
                                    {finalCaseChunks.length > 0 && (
                                        <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px] bg-indigo-100/50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                                            {finalCaseChunks.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <div className="p-4 bg-muted/10">
                                <TabsContent value="statutes" className="mt-0 focus-visible:ring-0">
                                    {finalStatuteChunks.length > 0 ? (
                                        <div className="flex flex-col gap-4 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {finalStatuteChunks.map((chunk, index) => renderChunk(chunk, index, 'statute'))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                            <Scale className="h-8 w-8 opacity-20" />
                                            <span className="text-xs">No statutory references cited.</span>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="cases" className="mt-0 focus-visible:ring-0">
                                    {finalCaseChunks.length > 0 ? (
                                        <div className="flex flex-col gap-4 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {finalCaseChunks.map((chunk, index) => renderChunk(chunk, index, 'case'))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                            <Gavel className="h-8 w-8 opacity-20" />
                                            <span className="text-xs">No case law references cited.</span>
                                        </div>
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
