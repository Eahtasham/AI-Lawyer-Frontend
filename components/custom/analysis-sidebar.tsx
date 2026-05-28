"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalysisItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  File,
  Trash2,
  MoreHorizontal,
  Loader2,
  Scale,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface AnalysisSidebarProps {
  analyses: AnalysisItem[];
  currentAnalysisId: string | null;
  onNewAnalysis: () => void;
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onCloseMobile?: () => void;
}

function getFileIcon(fileType: string) {
  if (fileType === "pdf")
    return <FileText className="h-4 w-4 shrink-0 text-red-400" />;
  if (fileType === "docx")
    return <File className="h-4 w-4 shrink-0 text-blue-400" />;
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-1.5 py-0",
        status === "completed" &&
          "border-green-500/50 text-green-400 bg-green-500/10",
        status === "processing" &&
          "border-blue-500/50 text-blue-400 bg-blue-500/10",
        status === "pending" &&
          "border-amber-500/50 text-amber-400 bg-amber-500/10",
        status === "failed" &&
          "border-red-500/50 text-red-400 bg-red-500/10"
      )}
    >
      {status === "processing" && (
        <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />
      )}
      {status}
    </Badge>
  );
}

export function AnalysisSidebar({
  analyses,
  currentAnalysisId,
  onNewAnalysis,
  onSelectAnalysis,
  onDeleteAnalysis,
  onCloseMobile,
}: AnalysisSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setAnalysisToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (analysisToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteAnalysis(analysisToDelete);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setAnalysisToDelete(null);
      }
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <>
        <div
          className={cn(
            "flex flex-col h-screen bg-white dark:bg-[#171717] border-r border-sidebar-border transition-all duration-300 ease-in-out relative",
            isCollapsed ? "w-[70px]" : "w-[260px]"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex h-16 items-center border-b border-sidebar-border shrink-0",
              isCollapsed ? "justify-center" : "justify-between px-4"
            )}
          >
            {!isCollapsed ? (
              <>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 font-semibold text-sidebar-foreground tracking-tight"
                >
                  <div className="h-9 w-9 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                    <Scale className="h-5 w-5" />
                  </div>
                </Link>
                {onCloseMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCloseMobile}
                    className="h-8 w-8 md:hidden text-muted-foreground hover:text-sidebar-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(true)}
                  className="hidden md:flex text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <PanelLeftClose className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <div
                className="group relative flex h-10 w-10 items-center justify-center cursor-pointer rounded-lg hover:bg-sidebar-accent transition-colors"
                onClick={() => setIsCollapsed(false)}
              >
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0">
                  <div className="h-10 w-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                    <Scale className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 text-sidebar-foreground">
                  <PanelLeftOpen className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>

          {/* New Analysis Button */}
          <div
            className={cn("p-3", isCollapsed && "p-0 my-2 flex justify-center")}
          >
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onNewAnalysis}
                    className="h-9 w-11 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 border border-sidebar-border shadow-sm p-0 flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New Analysis</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={onNewAnalysis}
                className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 border border-sidebar-border shadow-sm transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Analysis
              </Button>
            )}
          </div>

          {/* Navigation links */}
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <Link href="/chat">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
                >
                  <MessageSquare className="h-4 w-4" />
                  Back to Chat
                </Button>
              </Link>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/chat">
                    <Button
                      variant="ghost"
                      className="h-9 w-11 rounded-xl p-0 flex items-center justify-center text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Back to Chat</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Analysis History */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-3">
              {!isCollapsed && (
                <h2 className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Document History
                </h2>
              )}
              <div className="space-y-1">
                <AnimatePresence>
                  {analyses.map((analysis) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "group flex items-center w-full rounded-md transition-all duration-200",
                        "hover:bg-sidebar-accent/50",
                        currentAnalysisId === analysis.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-1 min-w-0 relative",
                          isCollapsed && "flex justify-center w-full"
                        )}
                      >
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => onSelectAnalysis(analysis.id)}
                                variant="ghost"
                                className={cn(
                                  "h-9 w-9 rounded-xl p-0 flex items-center justify-center transition-none",
                                  currentAnalysisId === analysis.id
                                    ? "bg-sidebar-accent text-sidebar-foreground"
                                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                )}
                              >
                                {getFileIcon(analysis.file_type)}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {analysis.file_name}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            onClick={() => onSelectAnalysis(analysis.id)}
                            variant="ghost"
                            className={cn(
                              "w-full h-auto py-2 px-2 hover:bg-transparent justify-start gap-2 font-normal transition-none",
                              currentAnalysisId === analysis.id
                                ? "text-sidebar-foreground"
                                : "text-muted-foreground group-hover:text-sidebar-foreground"
                            )}
                          >
                            {getFileIcon(analysis.file_type)}
                            <div className="flex-1 min-w-0 text-left">
                              <span className="truncate text-sm block">
                                {analysis.file_name.length > 22
                                  ? analysis.file_name.slice(0, 20) + "..."
                                  : analysis.file_name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <StatusBadge status={analysis.status} />
                              </div>
                            </div>
                          </Button>
                        )}
                      </div>

                      {/* Delete menu */}
                      {!isCollapsed && (
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(analysis.id)}
                                className="text-red-400 focus:text-red-400 focus:bg-red-950/20 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {analyses.length === 0 && !isCollapsed && (
                  <p className="text-xs text-muted-foreground/60 text-center py-8">
                    No documents analyzed yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Delete confirmation */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this document analysis. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}
