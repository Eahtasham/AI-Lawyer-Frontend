import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AnalysisItem,
  AnalysisSection,
  FollowUpMessage,
  Chunk,
} from "@/types";
import {
  uploadDocument,
  streamAnalysis,
  fetchAnalyses,
  fetchAnalysis,
  deleteAnalysis as deleteAnalysisApi,
  streamFollowUp,
} from "@/lib/api";

interface AnalyzerState {
  analyses: AnalysisItem[];
  currentAnalysisId: string | null;
  currentSections: AnalysisSection[];
  currentChunks: Chunk[];
  logs: string[];
  followUpMessages: FollowUpMessage[];
  isUploading: boolean;
  isAnalyzing: boolean;
  isFollowUpLoading: boolean;
  error: string | null;

  // Actions
  setCurrentAnalysisId: (id: string | null) => void;
  upload: (file: File, token: string) => Promise<string | null>;
  startAnalysis: (analysisId: string, token: string) => Promise<void>;
  loadAnalyses: (token: string) => Promise<void>;
  loadAnalysis: (analysisId: string, token: string) => Promise<void>;
  deleteAnalysis: (analysisId: string, token: string) => Promise<void>;
  sendFollowUp: (
    analysisId: string,
    question: string,
    token: string
  ) => Promise<void>;
  resetCurrent: () => void;
  clearError: () => void;
}

export const useAnalyzerStore = create<AnalyzerState>()(
  persist(
    (set, get) => ({
      analyses: [],
      currentAnalysisId: null,
      currentSections: [],
      currentChunks: [],
      logs: [],
      followUpMessages: [],
      isUploading: false,
      isAnalyzing: false,
      isFollowUpLoading: false,
      error: null,

      setCurrentAnalysisId: (id) =>
        set({ currentAnalysisId: id, currentSections: [], currentChunks: [], logs: [], followUpMessages: [], error: null }),

      upload: async (file, token) => {
        set({ isUploading: true, error: null });
        try {
          const result = await uploadDocument(file, token);
          // Add to analyses list
          const newItem: AnalysisItem = {
            id: result.analysis_id,
            file_name: result.file_name,
            file_type: result.file_type,
            file_size: result.file_size,
            status: "pending",
            created_at: new Date().toISOString(),
          };
          set((state) => ({
            analyses: [newItem, ...state.analyses],
            currentAnalysisId: result.analysis_id,
            currentSections: [],
            currentChunks: [],
            logs: [],
            followUpMessages: [],
            isUploading: false,
          }));
          return result.analysis_id;
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Upload failed";
          set({ isUploading: false, error: msg });
          return null;
        }
      },

      startAnalysis: async (analysisId, token) => {
        set({
          isAnalyzing: true,
          error: null,
          currentSections: [],
          currentChunks: [],
          logs: [],
        });

        // Update status in list
        set((state) => ({
          analyses: state.analyses.map((a) =>
            a.id === analysisId ? { ...a, status: "processing" as const } : a
          ),
        }));

        try {
          await streamAnalysis(
            analysisId,
            (type, payload) => {
              switch (type) {
                case "log":
                  set((state) => ({
                    logs: [...state.logs, payload as string],
                  }));
                  break;
                case "section":
                  set((state) => ({
                    currentSections: [
                      ...state.currentSections,
                      payload as AnalysisSection,
                    ],
                  }));
                  break;
                case "chunks":
                  set({ currentChunks: payload as Chunk[] });
                  break;
                case "done":
                  // Analysis complete
                  break;
                case "data": {
                  const data = payload as Record<string, unknown>;
                  if (data.error) {
                    set({ error: data.error as string });
                  }
                  break;
                }
              }
            },
            token
          );

          // Update status in list
          set((state) => ({
            isAnalyzing: false,
            analyses: state.analyses.map((a) =>
              a.id === analysisId ? { ...a, status: "completed" as const } : a
            ),
          }));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Analysis failed";
          set((state) => ({
            isAnalyzing: false,
            error: msg,
            analyses: state.analyses.map((a) =>
              a.id === analysisId ? { ...a, status: "failed" as const } : a
            ),
          }));
        }
      },

      loadAnalyses: async (token) => {
        try {
          const analyses = await fetchAnalyses(token);
          set({ analyses });
        } catch (e) {
          console.error("Failed to load analyses:", e);
        }
      },

      loadAnalysis: async (analysisId, token) => {
        set({ error: null });
        try {
          const data = await fetchAnalysis(analysisId, token);
          const analysis = data.analysis || {};
          set({
            currentAnalysisId: analysisId,
            currentSections: analysis.sections || [],
            currentChunks: analysis.chunks || [],
            followUpMessages: [],
            logs: [],
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to load analysis";
          set({ error: msg });
        }
      },

      deleteAnalysis: async (analysisId, token) => {
        try {
          await deleteAnalysisApi(analysisId, token);
          set((state) => ({
            analyses: state.analyses.filter((a) => a.id !== analysisId),
            ...(state.currentAnalysisId === analysisId
              ? {
                  currentAnalysisId: null,
                  currentSections: [],
                  currentChunks: [],
                  logs: [],
                  followUpMessages: [],
                }
              : {}),
          }));
        } catch (e) {
          console.error("Failed to delete analysis:", e);
        }
      },

      sendFollowUp: async (analysisId, question, token) => {
        set((state) => ({
          isFollowUpLoading: true,
          followUpMessages: [
            ...state.followUpMessages,
            { role: "user" as const, content: question },
          ],
        }));

        let aiResponse = "";

        try {
          await streamFollowUp(
            analysisId,
            question,
            (type, payload) => {
              if (type === "token") {
                aiResponse += payload as string;
                // Update the AI message in progress
                set((state) => {
                  const msgs = [...state.followUpMessages];
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg && lastMsg.role === "ai") {
                    lastMsg.content = aiResponse;
                  } else {
                    msgs.push({ role: "ai", content: aiResponse });
                  }
                  return { followUpMessages: msgs };
                });
              }
            },
            token
          );

          // Finalize
          set((state) => {
            const msgs = [...state.followUpMessages];
            const lastMsg = msgs[msgs.length - 1];
            if (!lastMsg || lastMsg.role !== "ai") {
              msgs.push({ role: "ai", content: aiResponse || "No response received." });
            }
            return { followUpMessages: msgs, isFollowUpLoading: false };
          });
        } catch (e) {
          set((state) => ({
            isFollowUpLoading: false,
            followUpMessages: [
              ...state.followUpMessages,
              {
                role: "ai" as const,
                content: `Error: ${e instanceof Error ? e.message : "Failed to get response"}`,
              },
            ],
          }));
        }
      },

      resetCurrent: () =>
        set({
          currentAnalysisId: null,
          currentSections: [],
          currentChunks: [],
          logs: [],
          followUpMessages: [],
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "analyzer-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        analyses: state.analyses,
      }),
    }
  )
);
