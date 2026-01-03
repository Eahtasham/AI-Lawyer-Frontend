import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chunk } from "@/types";
import { BookOpen } from "lucide-react";

interface RetrievedChunksProps {
    chunks: Chunk[];
}

export function RetrievedChunks({ chunks }: RetrievedChunksProps) {
    if (!chunks || chunks.length === 0) return null;

    return (
        <div className="mt-2 w-full">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sources" className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>References</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ScrollArea className="h-[200px] w-full pr-4">
                            <div className="flex flex-col gap-3 pb-3">
                                {chunks.map((chunk, index) => (
                                    <div
                                        key={index}
                                        className="rounded-md bg-muted/50 p-3 text-sm"
                                    >
                                        <div className="mb-2 flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-xs text-primary">
                                                    Source {index + 1}
                                                </span>
                                                {chunk.score && (
                                                    <span className="text-[10px] text-muted-foreground/70">
                                                        {Math.round(chunk.score * 100)}% Match
                                                    </span>
                                                )}
                                            </div>

                                            {chunk.metadata && (
                                                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                                    {chunk.metadata.law && (
                                                        <span className="font-medium text-foreground/90">
                                                            {chunk.metadata.law}
                                                            {chunk.metadata.year && (
                                                                <span className="text-muted-foreground ml-1">
                                                                    ({chunk.metadata.year})
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                    {chunk.metadata.enactment_date && (
                                                        <span className="text-[10px]">
                                                            Enacted: {chunk.metadata.enactment_date}
                                                        </span>
                                                    )}
                                                    {(chunk.metadata.chapter_number || chunk.metadata.chapter_title) && (
                                                        <span>
                                                            {chunk.metadata.chapter_number && `${chunk.metadata.chapter_number}: `}
                                                            {chunk.metadata.chapter_title}
                                                        </span>
                                                    )}
                                                    {(chunk.metadata.section_number || chunk.metadata.section_title) && (
                                                        <span>
                                                            {chunk.metadata.section_number && `Section ${chunk.metadata.section_number}: `}
                                                            {chunk.metadata.section_title}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground line-clamp-3 text-xs mt-2 border-t pt-2 border-border/50">
                                            {chunk.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
