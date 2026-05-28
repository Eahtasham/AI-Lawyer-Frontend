"use client";

import { useEffect, useState } from "react";
import { useAnalyzerStore } from "@/lib/store/analyzer-store";
import { AnalysisSidebar } from "@/components/custom/analysis-sidebar";
import { DocumentUpload } from "@/components/custom/document-upload";
import { AnalysisResults } from "@/components/custom/analysis-results";
import { DocumentFollowupChat } from "@/components/custom/document-followup-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu, FileSearch, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzeClientProps {
  accessToken: string;
}

export default function AnalyzeClient({ accessToken }: AnalyzeClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    analyses,
    currentAnalysisId,
    currentSections,
    currentChunks,
    logs,
    followUpMessages,
    isUploading,
    isAnalyzing,
    isFollowUpLoading,
    error,
    setCurrentAnalysisId,
    upload,
    startAnalysis,
    loadAnalyses,
    loadAnalysis,
    deleteAnalysis,
    sendFollowUp,
    resetCurrent,
    clearError,
  } = useAnalyzerStore();

  useEffect(() => {
    setMounted(true);
    loadAnalyses(accessToken);
  }, [accessToken, loadAnalyses]);

  const handleUpload = async (file: File) => {
    clearError();
    const analysisId = await upload(file, accessToken);
    if (analysisId) {
      // Auto-start analysis after upload
      await startAnalysis(analysisId, accessToken);
    }
  };

  const handleSelectAnalysis = async (id: string) => {
    setIsMobileSidebarOpen(false);
    const analysis = analyses.find((a) => a.id === id);
    if (analysis?.status === "completed") {
      await loadAnalysis(id, accessToken);
    } else {
      setCurrentAnalysisId(id);
    }
  };

  const handleNewAnalysis = () => {
    resetCurrent();
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteAnalysis = async (id: string) => {
    await deleteAnalysis(id, accessToken);
  };

  const handleFollowUp = async (question: string) => {
    if (!currentAnalysisId) return;
    await sendFollowUp(currentAnalysisId, question, accessToken);
  };

  if (!mounted) return null;

  const showUpload = !currentAnalysisId && !isAnalyzing;
  const showResults = currentSections.length > 0 || isAnalyzing;
  const showFollowUp =
    currentAnalysisId && currentSections.length > 0 && !isAnalyzing;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AnalysisSidebar
          analyses={analyses}
          currentAnalysisId={currentAnalysisId}
          onNewAnalysis={handleNewAnalysis}
          onSelectAnalysis={handleSelectAnalysis}
          onDeleteAnalysis={handleDeleteAnalysis}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="sr-only">Document History</SheetTitle>
          <AnalysisSidebar
            analyses={analyses}
            currentAnalysisId={currentAnalysisId}
            onNewAnalysis={handleNewAnalysis}
            onSelectAnalysis={handleSelectAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-foreground">
                Document Analyzer
              </h1>
            </div>
          </div>
          {currentAnalysisId && (
            <div className="text-sm text-muted-foreground">
              {analyses.find((a) => a.id === currentAnalysisId)?.file_name}
            </div>
          )}
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Upload State */}
            {showUpload && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-2xl bg-sidebar-accent flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-sidebar-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Legal Document Analyzer
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Upload a legal document to get a comprehensive analysis
                    including key clauses, risks, obligations, and
                    cross-references with Indian law databases.
                  </p>
                </div>
                <DocumentUpload
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  error={error}
                />
              </div>
            )}

            {/* Analysis Results */}
            {showResults && (
              <AnalysisResults
                sections={currentSections}
                isAnalyzing={isAnalyzing}
                logs={logs}
              />
            )}

            {/* Follow-up Chat */}
            {showFollowUp && (
              <DocumentFollowupChat
                messages={followUpMessages}
                isLoading={isFollowUpLoading}
                onSend={handleFollowUp}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
