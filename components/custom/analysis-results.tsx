"use client";

import { AnalysisSection } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Scale,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnalysisResultsProps {
  sections: AnalysisSection[];
  isAnalyzing: boolean;
  logs: string[];
}

const sectionConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  Summary: {
    icon: <FileText className="h-5 w-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  "Key Clauses": {
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  "Risk Analysis": {
    icon: <ShieldAlert className="h-5 w-5" />,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  "Obligations & Deadlines": {
    icon: <Clock className="h-5 w-5" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  "Legal Jargon Simplified": {
    icon: <Scale className="h-5 w-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  "Related Laws & Precedents": {
    icon: <Scale className="h-5 w-5" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
};

function SeverityBadge({ severity }: { severity?: string }) {
  if (!severity) return null;
  const s = severity.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        s === "high" && "border-red-500/50 text-red-400 bg-red-500/10",
        s === "medium" && "border-amber-500/50 text-amber-400 bg-amber-500/10",
        s === "low" && "border-green-500/50 text-green-400 bg-green-500/10"
      )}
    >
      {s === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
      {severity}
    </Badge>
  );
}

function SectionCard({
  section,
  index,
}: {
  section: AnalysisSection;
  index: number;
}) {
  const config = sectionConfig[section.title] || {
    icon: <FileText className="h-5 w-5" />,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center",
                config.bgColor,
                config.color
              )}
            >
              {config.icon}
            </div>
            <span>{section.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content-based section (Summary, Related Laws) */}
          {section.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Items-based sections */}
          {section.items && section.items.length > 0 && (
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="mt-0.5 shrink-0">
                    {item.severity ? (
                      <SeverityBadge severity={item.severity} />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-sidebar-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Legal Jargon: term → simplified */}
                    {item.term ? (
                      <>
                        <p className="text-sm font-medium text-foreground">
                          {item.term}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.simplified}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-foreground">
                          {item.text}
                        </p>
                        {item.significance && (
                          <p className="text-xs text-muted-foreground">
                            {item.significance}
                          </p>
                        )}
                        {item.party && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {item.party}
                            </Badge>
                            {item.deadline && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.deadline}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AnalysisResults({
  sections,
  isAnalyzing,
  logs,
}: AnalysisResultsProps) {
  return (
    <div className="space-y-4">
      {/* Live logs */}
      {isAnalyzing && logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-muted/30 border border-border/50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Analysis Progress
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <p key={i} className="text-xs text-muted-foreground font-mono">
                {log}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sections */}
      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section, i) => (
            <SectionCard key={section.title + i} section={section} index={i} />
          ))}
        </div>
      ) : isAnalyzing ? (
        <AnalysisSkeleton />
      ) : null}

      {/* Completion indicator */}
      {!isAnalyzing && sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-emerald-400 py-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Analysis complete — {sections.length} sections generated</span>
        </motion.div>
      )}
    </div>
  );
}
