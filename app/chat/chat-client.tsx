"use client";

import { ChatInput } from "@/components/custom/chat-input";
import { MessageList } from "@/components/custom/message-list";
import { Sidebar } from "@/components/custom/sidebar";
import { fetchChatResponse, streamChatResponseWithFetch } from "@/lib/api";
import { Message } from "@/types";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store/chat-store";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Add Props interface
interface ChatClientProps {
    accessToken: string;
}

export default function ChatPage({ accessToken }: ChatClientProps) {
    // Zustand Store
    // Zustand Store
    const sessions = useChatStore((state) => state.sessions);
    const currentSessionId = useChatStore((state) => state.currentSessionId);
    
    // Actions (stable functions, can be selected individually or destructured from state if we accept re-renders)
    // To avoid "new object" issues, we select the state itself or use multiple selectors.
    // For readability, let's select individually or just use the store actions directly where needed.
    // Or better, define a selector for actions outside if possible, but they are on state.
    const setSessions = useChatStore((state) => state.setSessions);
    const setCurrentSessionId = useChatStore((state) => state.setCurrentSessionId);
    const addSession = useChatStore((state) => state.addSession);
    const updateSession = useChatStore((state) => state.updateSession);
    const updateMessages = useChatStore((state) => state.updateMessages);
    const deleteSession = useChatStore((state) => state.deleteSession);
    const clearStore = useChatStore((state) => state.clearStore);
    const syncSessions = useChatStore((state) => state.syncSessions);

    // Group for convenience
    const actions = {
        setSessions,
        setCurrentSessionId,
        addSession,
        updateSession,
        updateMessages,
        deleteSession,
        clearStore,
        syncSessions
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);
    // Initialize token with prop
    const [token, setToken] = useState<string | null>(accessToken);
    const [user, setUser] = useState<User | null>(null);

    // Get current session and messages
    const currentSession = sessions.find(s => s.id === currentSessionId);
    // If no session is selected but sessions exist, select first? Or handled by store init?
    // We'll trust the store state or fallback.
    const messages = currentSession?.messages || [];

    useEffect(() => {
        setMounted(true);
        
        // Sync with Supabase
        actions.syncSessions();

        // Listen for Auth Changes (e.g. token refresh)
        const supabase = createClient();
        
        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
             if (session) {
                 setToken(session.access_token);
                 setUser(session.user);
             } else if (event === 'SIGNED_OUT') {
                 setToken(null);
                 setUser(null);
                 router.push("/login");
             }
        });
        
        // Initial setup if no sessions
        if (useChatStore.getState().sessions.length === 0) {
             handleNewChat();
        }

        return () => {
             subscription.unsubscribe();
        };
    }, [accessToken]);

    // Effect to ensuring a session is selected if list isn't empty but current is null?
    useEffect(() => {
        if (mounted && sessions.length > 0 && !currentSessionId) {
             actions.setCurrentSessionId(sessions[0].id);
        }
    }, [mounted, sessions, currentSessionId]);


    const router = useRouter();

    const handleNewChat = () => {
        // Check for existing empty session to prevent spamming
        const emptySession = sessions.find(s => s.messages.length === 0);
        if (emptySession) {
            actions.setCurrentSessionId(emptySession.id);
            return;
        }

        const newSessionId = uuidv4();
        const newSession = {
            id: newSessionId,
            title: "New Chat",
            messages: [],
            updatedAt: Date.now()
        };
        actions.addSession(newSession);
        actions.setCurrentSessionId(newSessionId);
    };

    const handleSelectSession = (sessionId: string) => {
        actions.setCurrentSessionId(sessionId);
    };

    const handleDeleteSession = async (sessionId: string) => {
        setIsDeleting(true);
        
        // If we are authenticated, delete from backend first
        if (token) {
            try {
                await import("@/lib/api").then(mod => mod.deleteConversation(sessionId, token));
            } catch (error: any) {
                // Ignore "Not Found" errors as it likely means the conversation wasn't persisted yet (e.g. New Chat)
                if (error.message && (error.message.includes("Not Found") || error.message.includes("404"))) {
                    console.warn(`Conversation ${sessionId} not found on backend, treated as local delete.`);
                } else {
                    console.error("Failed to delete conversation from backend:", error);
                }
            }
        }
        
        // Optimistic delete (or rather, now synchronized)
        actions.deleteSession(sessionId);
        
        // If current session was deleted, switch to new chat (handled by store usually, but explicit check good)
        if (currentSessionId === sessionId) {
            handleNewChat();
        }
        setIsDeleting(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        actions.clearStore();
        router.push("/login");
    };

    const handleSend = async (query: string) => {
        if (!currentSessionId) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: "user",
            content: query,
            timestamp: Date.now(),
        };

        const aiMessageId = uuidv4();
        const initialAiMessage: Message = {
            id: aiMessageId,
            role: "ai",
            content: "",
            timestamp: Date.now(),
            logs: [],
            council_opinions: [],
            isStreaming: true,
        };

        // Optimistically update Store using messages of current session
        const updatedMessages = [...messages, userMessage, initialAiMessage];
        actions.updateMessages(currentSessionId, updatedMessages);
        
        setIsLoading(true);

        // Helper to update specific message in the list
        const updateAiMessage = (updates: Partial<Message>) => {
            const currentMsgs = useChatStore.getState().sessions.find(s => s.id === currentSessionId)?.messages || [];
            const newMsgs = currentMsgs.map(msg => 
                msg.id === aiMessageId ? { ...msg, ...updates } : msg
            );
            actions.updateMessages(currentSessionId, newMsgs);
        };

        try {
            // Note: We might need to pass `conversation_id` if we want Backend to link it immediately.
            // But currently `streamChatResponseWithFetch` implies a GET stream. 
            // If we want to link it, we should ideally CREATE the conversation on backend first or pass ID.
            // Our backend `stream_chat` creates a new conversation for each request if logic isn't changed greatly.
            // Actually, I modified `stream_chat` to handle legacy style.
            // Ideally, we should switch to `fetchChatResponse` (POST) if we want better control, but user wanted "Live Streaming".
            // So we stick to stream.
            
            await streamChatResponseWithFetch(
                query,
                (type, payload) => {
                    // Get latest messages from store to ensure no race conditions (though simple variable capture works for now)
                     const currentMsgs = useChatStore.getState().sessions.find(s => s.id === currentSessionId)?.messages || [];
                     const currentAiMsg = currentMsgs.find(m => m.id === aiMessageId);
                     if (!currentAiMsg) return;

                     const newMsg = { ...currentAiMsg };

                    if (type === 'log') {
                        newMsg.logs = [...(newMsg.logs || []), payload as string];
                    } else if (type === 'opinion') {
                        const opinionPayload = payload as { role: string; model: string; opinion: string };
                        const exists = newMsg.council_opinions?.some(op => op.role === opinionPayload.role);
                        if (!exists) {
                            newMsg.council_opinions = [...(newMsg.council_opinions || []), opinionPayload];
                        }
                    } else if (type === 'chunks') {
                        newMsg.chunks = payload as Message['chunks'];
                    } else if (type === 'data') {
                        const dataPayload = payload as { answer?: string; error?: string };
                        if (dataPayload.answer) {
                            newMsg.content = dataPayload.answer;
                            newMsg.isStreaming = false;
                        }
                        if (dataPayload.error) {
                            newMsg.content = `Error: ${dataPayload.error}`;
                            newMsg.isStreaming = false;
                        }
                    }
                    
                    // Update store
                    const newerMsgs = currentMsgs.map(m => m.id === aiMessageId ? newMsg : m);
                    actions.updateMessages(currentSessionId, newerMsgs);
                },
                token || undefined,
                currentSessionId || undefined
            );

        } catch (error) {
            console.error("Failed to fetch response:", error);
            updateAiMessage({
                content: "Sorry, I encountered an error while processing your request.",
                isStreaming: false
            });
        } finally {
            setIsLoading(false);
            updateAiMessage({ isStreaming: false });
            
            // Generate title if new chat
            const session = useChatStore.getState().sessions.find(s => s.id === currentSessionId);
            if (session && (session.title === "New Chat" || !session.title)) {
                 const title = query.slice(0, 30) + (query.length > 30 ? "..." : "");
                 actions.updateSession(currentSessionId, { title });
            }
        }
    };

    const handleEdit = async (messageId: string, newContent: string) => {
        // Edit logic similiar to original but using store
        if (!currentSessionId) return;
        
        const index = messages.findIndex((m) => m.id === messageId);
        if (index === -1) return;

        const truncatedHistory = messages.slice(0, index);
        
        const updatedMessage: Message = {
            ...messages[index],
            content: newContent,
            timestamp: Date.now(),
        };

        const aiMessage: Message = {
            id: uuidv4(),
            role: "ai",
            content: "",
            timestamp: Date.now(),
            isStreaming: true // Or false if using fetchChatResponse (non-stream)
        };
        
        // Update store with new history + placeholder AI
        // Wait, handleEdit in original used `fetchChatResponse` (non-streaming).
        // I should stick to that or upgrade to stream. Original used `fetchChatResponse`.
        // So `isStreaming` false initially, but actually `fetchChatResponse` awaits full response.
        
        // Optimistic update
        actions.updateMessages(currentSessionId, [...truncatedHistory, updatedMessage]);
        setIsLoading(true);

        try {
            const response = await fetchChatResponse(
                { query: newContent, top_k: 5, conversation_id: currentSessionId },
                token || undefined
            );

            const finalAiMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: response.answer,
                chunks: response.chunks,
                timestamp: Date.now(),
            };
            
            actions.updateMessages(currentSessionId, [...truncatedHistory, updatedMessage, finalAiMessage]);

        } catch (error) {
            console.error("Failed to fetch response:", error);
             const errorMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                timestamp: Date.now(),
            };
            actions.updateMessages(currentSessionId, [...truncatedHistory, updatedMessage, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async () => {
         if (!currentSessionId || messages.length < 2) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== "ai") return; // Can only regenerate AI response

        const newHistory = messages.slice(0, -1);
        const queryMessage = newHistory[newHistory.length - 1];
        
        if (queryMessage.role !== "user") return;

        // Reset to history without last AI
        actions.updateMessages(currentSessionId, newHistory);
        setIsLoading(true);

        try {
            const response = await fetchChatResponse(
                { query: queryMessage.content, top_k: 5, conversation_id: currentSessionId },
                token || undefined
            );

            const aiMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: response.answer,
                chunks: response.chunks,
                timestamp: Date.now(),
            };
             actions.updateMessages(currentSessionId, [...newHistory, aiMessage]);

        } catch (error) {
             console.error("Failed to fetch response:", error);
             // Error handling
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar
                className="hidden md:flex"
                sessions={sessions}
                currentSessionId={currentSessionId}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onLogout={handleLogout}
                user={user}
            />

            <main className="flex flex-1 flex-col h-full relative min-w-0">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[280px] border-r border-white/10 bg-black text-white">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <Sidebar
                                className="border-r-0 w-full"
                                sessions={sessions}
                                currentSessionId={currentSessionId}
                                onNewChat={() => {
                                    handleNewChat();
                                }}
                                onSelectSession={handleSelectSession}
                                onDeleteSession={handleDeleteSession}
                                onLogout={handleLogout}
                                user={user}
                            />
                        </SheetContent>
                    </Sheet>
                    <div className="font-semibold text-lg flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        SamVidhaan AI
                    </div>
                    {/* Placeholder for balance */}
                     <div className="w-8" />
                </div>
                
                {/* Desktop Header */}
                 <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-white/10 bg-background/95 backdrop-blur z-20 h-16">
                     <div className="flex flex-col">
                         <h2 className="text-lg font-semibold tracking-tight truncate max-w-xl">
                             {currentSession?.title || "New Chat"}
                         </h2>
                         <p className="text-xs text-muted-foreground">
                             {messages.length} messages
                         </p>
                     </div>
                     <div className="flex items-center gap-2">
                         {currentSessionId && messages.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10" title="Delete Chat">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-white/60">
                                            This action cannot be undone. This will permanently delete your conversation history.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 hover:text-white text-white">Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteSession(currentSessionId);
                                            }}
                                            className="bg-red-500 text-white hover:bg-red-600 border-none"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         )}
                     </div>
                 </div>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                            <h2 className="text-4xl font-semibold tracking-tight mb-4">
                                SamVidhaanAI
                            </h2>
                            <p className="text-xl text-muted-foreground/80 max-w-md">
                                Your Personal Supercharged Legal Assistant
                            </p>
                        </div>
                    ) : (
                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onRegenerate={handleRegenerate}
                            user={user}
                        />
                    )}
                </div>
                <div className="w-full max-w-3xl mx-auto z-10 px-4 mb-2">
                    <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
            </main>
        </div>
    );
}
