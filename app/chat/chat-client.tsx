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
import { Menu, Home, MoreHorizontal, Pencil, Trash, Pin, PinOff, SquarePen, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store/chat-store";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { UserProfileDropdown } from '@/components/custom/user-profile-dropdown';
import { Settings, LogOut, Loader2, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsModal } from "@/components/custom/settings-modal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
    const renameSession = useChatStore((state) => state.renameSession);
    const togglePinSession = useChatStore((state) => state.togglePinSession);

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

    const [generatingSessionId, setGeneratingSessionId] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    // Initialize token with prop
    const [token, setToken] = useState<string | null>(accessToken);
    const [user, setUser] = useState<User | null>(null);

    const [profile, setProfile] = useState<{ username: string; full_name: string; avatar_url: string } | null>(null);
    const [appVersion, setAppVersion] = useState<string>("");
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Auth Check: Redirect if session is invalid on mount (handles Back Button cache)
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Force hard reload if session is missing to clear any ghost state
                window.location.replace("/login");
            }
        };
        checkSession();
    }, []);

    // Get current session and messages
    const currentSession = sessions.find(s => s.id === currentSessionId);
    // If no session is selected but sessions exist, select first? Or handled by store init?
    // We'll trust the store state or fallback.
    const messages = currentSession?.messages || [];

    const userInitials = profile?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "AI";
    
    useEffect(() => {
        setMounted(true);
        // Fetch App Version
        fetch('/api/version')
            .then(res => res.json())
            .then(data => {
                if (data.version) {
                    // Format version: 1.7.2 -> 1.7 (if needed, but user said "like 1.7 (not 1.7.2)")
                    // If backend gives 1.7.2, we slice it?
                    // Let's assumbe we want the first two parts if there are 3.
                    const parts = data.version.split('.');
                    if (parts.length >= 2) {
                        setAppVersion(`${parts[0]}.${parts[1]}`);
                    } else {
                        setAppVersion(data.version);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch version", err));
    }, []);

    const fetchProfile = async (userId: string) => {
        const supabase = createClient();
        const { data } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', userId)
            .single();
        
        if (data) {
            setProfile(data);
        }
    };

    useEffect(() => {
        if (!accessToken) return;

        // Sync with Supabase
        actions.syncSessions();

        // Listen for Auth Changes (e.g. token refresh)
        const supabase = createClient();

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) fetchProfile(user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setToken(session.access_token);
                setUser(session.user);
                fetchProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setToken(null);
                setUser(null);
                setProfile(null);
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
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        actions.clearStore();
        // Use replace to prevent back-navigation to chat
        window.location.replace("/");
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

        setGeneratingSessionId(currentSessionId);

        const updateAiMessage = (updates: Partial<Message>) => {
            const currentMsgs = useChatStore.getState().sessions.find(s => s.id === currentSessionId)?.messages || [];
            const newMsgs = currentMsgs.map(msg =>
                msg.id === aiMessageId ? { ...msg, ...updates } : msg
            );
            actions.updateMessages(currentSessionId, newMsgs);
        };

        const controller = new AbortController();
        setAbortController(controller);

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
                currentSessionId || undefined,
                controller.signal
            );

        } catch (error: any) {
            if (error.name === 'AbortError') {
                 console.log("Generation stopped by user");
                 updateAiMessage({ isStreaming: false });
            } else {
                console.error("Failed to fetch response:", error);
                updateAiMessage({
                    content: "Sorry, I encountered an error while processing your request.",
                    isStreaming: false
                });
            }
        } finally {
            setGeneratingSessionId(null);
            setAbortController(null);
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
        setGeneratingSessionId(currentSessionId);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetchChatResponse(
                { query: newContent, top_k: 5, conversation_id: currentSessionId },
                token || undefined,
                controller.signal
            );

            const finalAiMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: response.answer,
                chunks: response.chunks,
                timestamp: Date.now(),
            };

            actions.updateMessages(currentSessionId, [...truncatedHistory, updatedMessage, finalAiMessage]);

        } catch (error: any) {
            if (error.name === 'AbortError') {
                 console.log("Edit generation stopped by user");
                 // We might want to remove the loading indicator but maybe keep the user message?
                 // Current logic leaves the "AI typing..." placeholder or whatever.
                 // Actually, we haven't added the AI message to the store yet in the happy path until response comes (wait, line 380).
                 // But wait, line 369/380 updates with finalAiMessage.
                 // Unlike handleSend, handleEdit does NOT put a temporary AI message in the store BEFORE fetching?
                 // Let's check lines 349-353.
                 // It updates store with truncatedHistory + updatedMessage.
                 // It does NOT add a placeholder AI message.
                 // So if we stop, there's no "half-finished" AI message to fix. 
                 // We just stop loading.
            } else {
                console.error("Failed to fetch response:", error);
                const errorMessage: Message = {
                    id: uuidv4(),
                    role: "ai",
                    content: "Sorry, I encountered an error while processing your request. Please try again.",
                    timestamp: Date.now(),
                };
                actions.updateMessages(currentSessionId, [...truncatedHistory, updatedMessage, errorMessage]);
            }
        } finally {
            setGeneratingSessionId(null);
            setAbortController(null);
        }
    };

    const handleRegenerate = async (messageId?: string) => {
        if (!currentSessionId) return;

        let targetMessageIndex = -1;
        
        // If messageId provided, find it. Else default to last message.
        if (messageId) {
            targetMessageIndex = messages.findIndex(m => m.id === messageId);
        } else {
            targetMessageIndex = messages.length - 1;
        }

        if (targetMessageIndex === -1) return;

        const targetMessage = messages[targetMessageIndex];
        if (targetMessage.role !== "ai") return; 

        // We need the preceding user message to be the query
        const precedingMessageIndex = targetMessageIndex - 1;
        if (precedingMessageIndex < 0) return;
        
        const queryMessage = messages[precedingMessageIndex];
        if (queryMessage.role !== "user") return;

        // Truncate history: Keep everything up to (and including) the user message
        const newHistory = messages.slice(0, precedingMessageIndex + 1);
        
        // Optimistic update: Update store to truncated history + New Empty AI Message
        // unique ID for new attempt
        const newAiMessageId = uuidv4();
        const initialAiMessage: Message = {
            id: newAiMessageId,
            role: "ai",
            content: "",
            timestamp: Date.now(),
            logs: [],
            council_opinions: [],
            isStreaming: true,
        };

        const updatedMessages = [...newHistory, initialAiMessage];
        actions.updateMessages(currentSessionId, updatedMessages);
        setGeneratingSessionId(currentSessionId);

        const controller = new AbortController();
        setAbortController(controller);

        // Define updater
        const updateAiMessage = (updates: Partial<Message>) => {
            const currentMsgs = useChatStore.getState().sessions.find(s => s.id === currentSessionId)?.messages || [];
            const newMsgs = currentMsgs.map(msg => 
                msg.id === newAiMessageId ? { ...msg, ...updates } : msg
            );
            actions.updateMessages(currentSessionId, newMsgs);
        };

        try {
            await streamChatResponseWithFetch(
                queryMessage.content,
                (type, payload) => {
                     // Fetch refreshing store state inside callback
                     const currentMsgs = useChatStore.getState().sessions.find(s => s.id === currentSessionId)?.messages || [];
                     const currentAiMsg = currentMsgs.find(m => m.id === newAiMessageId);
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

                     const newerMsgs = currentMsgs.map(m => m.id === newAiMessageId ? newMsg : m);
                     actions.updateMessages(currentSessionId, newerMsgs);
                },
                token || undefined,
                currentSessionId || undefined,
                controller.signal
            );
        } catch (error: any) {
             if (error.name === 'AbortError') {
                 console.log("Regeneration stopped by user");
                 updateAiMessage({ isStreaming: false });
            } else {
                console.error("Failed to regenerate response:", error);
                updateAiMessage({
                    content: "Sorry, I encountered an error while regenerating the response.",
                    isStreaming: false
                });
            }
        } finally {
            setGeneratingSessionId(null);
            setAbortController(null);
            updateAiMessage({ isStreaming: false });
        }
    };

    const handleStop = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            // Don't set state null here, logic flows to finally block of the async operation?
            // Actually abort() triggers exception in fetch(), which goes to catch -> finally.
            // But we should might as well ensure UI update just in case.
            // Actually, waiting for finally is safer to avoid race condition.
            // But to be responsive, we can set it. 
            // However, the catch block sets isStreaming false.
            setGeneratingSessionId(null);
            
            // Locate streaming message and mark stopped
            if (currentSessionId) {
                 const currentMsgs = useChatStore.getState().sessions.find(s => s.id === currentSessionId)?.messages || [];
                 const streamingMsg = currentMsgs.find(m => m.isStreaming);
                 if (streamingMsg) {
                      const newMsgs = currentMsgs.map(m => m.id === streamingMsg.id ? { ...m, isStreaming: false } : m);
                      actions.updateMessages(currentSessionId, newMsgs);
                 }
            }
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
                user={user}
                profile={profile}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onLogout={handleLogout}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <main className="flex flex-1 flex-col h-full relative min-w-0">
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-3 py-3 border-b md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="-ml-1 h-9 w-9 p-0 text-muted-foreground hover:text-foreground">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[280px] border-r border-border bg-sidebar text-sidebar-foreground">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <Sidebar
                                className="border-r-0 w-full"
                                sessions={sessions}
                                currentSessionId={currentSessionId}
                                user={user}
                                profile={profile}
                                onNewChat={() => {
                                    handleNewChat();
                                }}
                                onSelectSession={handleSelectSession}
                                onDeleteSession={handleDeleteSession}
                                onLogout={handleLogout}
                                onOpenSettings={() => setIsSettingsOpen(true)}
                                onCloseMobile={() => {}} 
                            />
                        </SheetContent>
                    </Sheet>
                    
                    <div className="font-semibold text-lg flex items-center gap-1.5 flex-1 min-w-0 -ml-1">
                        <Scale className="h-5 w-5 shrink-0" />
                        <span className="truncate flex items-center">
                            SamVidhaan 
                            {appVersion && (
                                <span className="text-[10px] font-medium bg-muted/50 border border-white/5 px-2 py-0.5 rounded-full ml-2 text-muted-foreground/80 tracking-wide">
                                    v{appVersion}
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Actions: New Chat + Options + Profile */}
                    <div className="flex items-center gap-1">
                         {messages.length > 0 && (
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNewChat}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <SquarePen className="h-5 w-5" />
                            </Button>
                         )}

                        {messages.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                        setNewTitle(currentSession?.title || "");
                                        setIsRenameDialogOpen(true);
                                    }}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        if (currentSessionId) togglePinSession(currentSessionId, !currentSession?.isPinned);
                                    }}>
                                        {currentSession?.isPinned ? (
                                            <>
                                                <PinOff className="mr-2 h-4 w-4" />
                                                Unpin
                                            </>
                                        ) : (
                                            <>
                                                <Pin className="mr-2 h-4 w-4" />
                                                Pin
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => {
                                            if (currentSessionId) handleDeleteSession(currentSessionId);
                                        }}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <UserProfileDropdown
                            user={user}
                            profile={profile || null}
                            onLogout={handleLogout}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                            sideOffset={12}
                            trigger={
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-background/95 backdrop-blur z-20 h-16">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold tracking-tight truncate max-w-xl flex items-center">
                            SamVidhaan 
                            {appVersion && (
                                <span className="text-[10px] font-medium bg-muted/50 border border-white/5 px-2 py-0.5 rounded-full ml-2 text-muted-foreground/80 tracking-wide">
                                    v{appVersion}
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {messages.length} messages
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    setNewTitle(currentSession?.title || "");
                                    setIsRenameDialogOpen(true);
                                }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    if (currentSessionId) togglePinSession(currentSessionId, !currentSession?.isPinned);
                                }}>
                                    {currentSession?.isPinned ? (
                                        <>
                                            <PinOff className="mr-2 h-4 w-4" />
                                            Unpin
                                        </>
                                    ) : (
                                        <>
                                            <Pin className="mr-2 h-4 w-4" />
                                            Pin
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                        if (currentSessionId) handleDeleteSession(currentSessionId);
                                    }}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>


                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Scale className="h-12 w-12 text-foreground/80" />
                            </div>
                            <h2 className="text-4xl font-semibold tracking-tight mb-4">
                                SamVidhaan
                            </h2>
                            <p className="text-xl text-muted-foreground/80 max-w-md">
                                Your Personal AI-Supercharged Legal Assistant
                            </p>
                        </div>
                    ) : (
                        <MessageList
                            messages={messages}
                            isLoading={generatingSessionId === currentSessionId}
                            onEdit={handleEdit}
                            onRegenerate={handleRegenerate}
                            user={user}
                            profile={profile}
                        />
                    )}
                </div>
                <div className="w-full max-w-3xl mx-auto z-10 px-4 mb-2">
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[85%] lg:w-full lg:max-w-4xl z-10 px-0">
                    <ChatInput 
                        onSend={handleSend} 
                        isLoading={generatingSessionId === currentSessionId} 
                        disabled={generatingSessionId !== null}
                        onStop={handleStop} 
                    />
                </div>
            </main>
            <SettingsModal 
                open={isSettingsOpen} 
                onOpenChange={setIsSettingsOpen} 
                user={user} 
                profile={profile} 
                onProfileUpdate={() => user && fetchProfile(user.id)}
            />
            
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                        <DialogDescription>
                            Enter a new title for this conversation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="name"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="col-span-3"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (currentSessionId && newTitle.trim()) {
                                            renameSession(currentSessionId, newTitle.trim());
                                            setIsRenameDialogOpen(false);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={() => {
                             if (currentSessionId && newTitle.trim()) {
                                renameSession(currentSessionId, newTitle.trim());
                                setIsRenameDialogOpen(false);
                            }
                        }}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {isLoggingOut && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Logging out...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
