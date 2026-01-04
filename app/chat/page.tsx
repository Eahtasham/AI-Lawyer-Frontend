"use client";

import { ChatInput } from "@/components/custom/chat-input";
import { MessageList } from "@/components/custom/message-list";
import { Sidebar } from "@/components/custom/sidebar";
import { fetchChatResponse } from "@/lib/api";
import { ChatSession, Message } from "@/types";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home } from "lucide-react";

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        setMounted(true);
        const savedSessions = localStorage.getItem("chat_sessions");
        if (savedSessions) {
            try {
                const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
                setSessions(parsedSessions);

                // If there are sessions, load the most recent one, otherwise create new
                if (parsedSessions.length > 0) {
                    // Sort by updatedAt desc
                    const recent = parsedSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0];
                    setCurrentSessionId(recent.id);
                    setMessages(recent.messages);
                } else {
                    handleNewChat();
                }

            } catch (e) {
                console.error("Failed to parse chat sessions", e);
                handleNewChat();
            }
        } else {
            handleNewChat();
        }
    }, []);

    // Save sessions to localStorage whenever they change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("chat_sessions", JSON.stringify(sessions));
        }
    }, [sessions, mounted]);

    // Update current session in sessions array whenever messages change
    useEffect(() => {
        if (!mounted || !currentSessionId) return;

        setSessions((prev) => {
            return prev.map((session) => {
                if (session.id === currentSessionId) {
                    // Update title based on first message if needed and not set
                    let title = session.title;
                    if ((title === "New Chat" || !title) && messages.length > 0) {
                        const firstUserMsg = messages.find(m => m.role === "user");
                        if (firstUserMsg) {
                            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
                        }
                    }

                    return {
                        ...session,
                        messages: messages,
                        title: title,
                        updatedAt: Date.now()
                    };
                }
                return session;
            });
        });
    }, [messages, currentSessionId, mounted]);


    const handleNewChat = () => {
        const newSessionId = uuidv4();
        const newSession: ChatSession = {
            id: newSessionId,
            title: "New Chat",
            messages: [],
            updatedAt: Date.now()
        };

        setSessions((prev) => [...prev, newSession]);
        setCurrentSessionId(newSessionId);
        setMessages([]);
    };

    const handleSelectSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setCurrentSessionId(sessionId);
            setMessages(session.messages);
        }
    };

    const handleClearHistory = () => {
        setSessions([]);
        setMessages([]);
        localStorage.removeItem("chat_sessions");
        handleNewChat();
    };

    const handleSend = async (query: string) => {
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

        setMessages((prev) => [...prev, userMessage, initialAiMessage]);
        setIsLoading(true);

        // Function to update the specific AI message in state
        const updateAiMessage = (updates: Partial<Message>) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, ...updates } : msg
                )
            );
        };

        try {
            await import("@/lib/api").then(mod => mod.streamChatResponseWithFetch(
                query,
                (type, payload) => {
                    setMessages((prev) => {
                        const current = prev.find(m => m.id === aiMessageId);
                        if (!current) return prev;

                        const newMsg = { ...current };

                        if (type === 'log') {
                            newMsg.logs = [...(newMsg.logs || []), payload as string];
                        } else if (type === 'opinion') {
                            // Check if opinion already exists to avoid dupes (though backend shouldn't send dupes)
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

                        return prev.map(m => m.id === aiMessageId ? newMsg : m);
                    });
                }
            ));

        } catch (error) {
            console.error("Failed to fetch response:", error);
            updateAiMessage({
                content: "Sorry, I encountered an error while processing your request.",
                isStreaming: false
            });
        } finally {
            setIsLoading(false);
            // Ensure streaming flag is off
            setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, isStreaming: false } : m));
        }
    };

    const handleEdit = async (messageId: string, newContent: string) => {
        const index = messages.findIndex((m) => m.id === messageId);
        if (index === -1) return;

        const truncatedHistory = messages.slice(0, index);

        const updatedMessage: Message = {
            ...messages[index],
            content: newContent,
            timestamp: Date.now(),
        };

        setMessages([...truncatedHistory, updatedMessage]);
        setIsLoading(true);

        try {
            const response = await fetchChatResponse({ query: newContent, top_k: 5 });

            const aiMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: response.answer,
                chunks: response.chunks,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to fetch response:", error);
            const errorMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (messages.length < 2) return;

        const lastMessage = messages[messages.length - 1];
        let queryMessage: Message;
        let newHistory: Message[];

        if (lastMessage.role === "ai") {
            newHistory = messages.slice(0, -1);
            queryMessage = newHistory[newHistory.length - 1];
        } else {
            return;
        }

        if (queryMessage.role !== "user") return;

        setMessages(newHistory);
        setIsLoading(true);

        try {
            const response = await fetchChatResponse({ query: queryMessage.content, top_k: 5 });

            const aiMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: response.answer,
                chunks: response.chunks,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to fetch response:", error);
            const errorMessage: Message = {
                id: uuidv4(),
                role: "ai",
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
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
                onClearHistory={handleClearHistory}
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
                                    // wrapper to close sheet if needed, but for now specific "close" logic might require controlled state if UX demands
                                }}
                                onSelectSession={handleSelectSession}
                                onClearHistory={handleClearHistory}
                            />
                        </SheetContent>
                    </Sheet>
                    <div className="font-semibold text-lg flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        AI Lawyer
                    </div>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                            <h2 className="text-4xl font-semibold tracking-tight mb-4">
                                AI Lawyer
                            </h2>
                            <p className="text-xl text-muted-foreground/80 max-w-md">
                                Your personal legal assistant for Indian laws and procedures.
                            </p>
                        </div>
                    ) : (
                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onRegenerate={handleRegenerate}
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
