"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileText, File, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  error?: string | null;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="h-8 w-8 text-red-400" />;
  if (ext === "docx") return <File className="h-8 w-8 text-blue-400" />;
  return <FileText className="h-8 w-8 text-muted-foreground" />;
}

export function DocumentUpload({ onUpload, isUploading, error }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: .${ext}. Allowed: PDF, DOCX, TXT`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB`;
    }
    if (file.size === 0) {
      return "File is empty";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        setSelectedFile(null);
        return;
      }
      setValidationError(null);
      setSelectedFile(file);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
  };

  const displayError = validationError || error;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto gap-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "w-full border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer",
          "hover:border-sidebar-primary/50 hover:bg-sidebar-accent/30",
          dragActive
            ? "border-sidebar-primary bg-sidebar-accent/40 scale-[1.02]"
            : "border-border",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onClick={() => {
          if (!isUploading) document.getElementById("file-input")?.click();
        }}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-sidebar-accent flex items-center justify-center">
              <Upload className="h-7 w-7 text-sidebar-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Drop your legal document here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — PDF, DOCX, TXT up to 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile.name)}
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setValidationError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-4 py-2 w-full">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full max-w-xs bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading & Extracting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Document
            </>
          )}
        </Button>
      )}
    </div>
  );
}
