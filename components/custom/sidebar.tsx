"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Home } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/types";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onClearHistory: () => void;
}

export function Sidebar({ 
    className, 
    sessions, 
    currentSessionId, 
    onNewChat, 
    onSelectSession, 
    onClearHistory 
}: SidebarProps) {
    return (
        <div className={cn("pb-12 h-screen w-[260px] bg-black text-white flex flex-col border-r border-white/10", className)}>
             <div className="flex h-14 items-center px-4 border-b border-white/10">
                <a href="/" className="flex items-center gap-2 font-semibold">
                    <Home className="h-5 w-5" />
                    <span>AI Lawyer</span>
                </a>
            </div>

            <div className="space-y-4 py-4 px-3">
                <Button 
                    onClick={onNewChat}
                    variant="outline" 
                    className="w-full justify-start gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New chat
                </Button>
            </div>
            
            <div className="px-3 py-2 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-white/50 uppercase">
                        Recents
                    </h2>
                    <div className="space-y-1">
                        {sessions.length === 0 && (
                             <p className="px-2 text-xs text-white/30 italic">No recent chats</p>
                        )}
                        {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map((session) => (
                             <Button 
                                key={session.id}
                                onClick={() => onSelectSession(session.id)}
                                variant={currentSessionId === session.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start font-normal truncate",
                                    currentSessionId === session.id 
                                        ? "bg-white/20 text-white hover:bg-white/20" 
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                                <span className="truncate text-left">{session.title || "New Chat"}</span>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="px-3 py-4 border-t border-white/10 space-y-2">
                 <Button 
                    onClick={onClearHistory}
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear conversations
                </Button>
            </div>
        </div>
    );
}
