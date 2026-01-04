import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Home, LogOut, MoreHorizontal, Pin, PinOff, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { useChatStore } from "@/lib/store/chat-store";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onLogout: () => void;
}

export function Sidebar({
    className,
    sessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onLogout
}: SidebarProps) {
    const { renameSession, togglePinSession } = useChatStore();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleRenameClick = (session: ChatSession) => {
        setSessionToRename(session);
        setNewTitle(session.title);
        setIsRenameDialogOpen(true);
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sessionToRename && newTitle.trim()) {
            await renameSession(sessionToRename.id, newTitle.trim());
            setIsRenameDialogOpen(false);
            setSessionToRename(null);
        }
    };

    const sortedSessions = [...sessions].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
    });

    return (
        <>
            <div className={cn("pb-12 h-screen w-[300px] bg-black text-white flex flex-col border-r border-white/10", className)}>
                <div className="flex h-14 items-center px-4 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Home className="h-5 w-5" />
                        <span>AI Lawyer</span>
                    </Link>
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
                        <div className="space-y-1 pr-2">
                            {sortedSessions.length === 0 && (
                                <p className="px-2 text-xs text-white/30 italic">No recent chats</p>
                            )}
                            {sortedSessions.map((session) => (
                                <div 
                                    key={session.id} 
                                    className="group relative flex items-center"
                                >
                                    <Button
                                        onClick={() => onSelectSession(session.id)}
                                        variant={currentSessionId === session.id ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start font-normal pr-12 pl-4 py-2 h-auto relative mb-1",
                                            currentSessionId === session.id
                                                ? "bg-white/20 text-white hover:bg-white/20"
                                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center w-full overflow-hidden">
                                            {session.isPinned && <Pin className="mr-2 h-3.5 w-3.5 shrink-0 rotate-45 text-white/70" />}
                                            <span className="truncate text-left flex-1" title={session.title}>{session.title || "New Chat"}</span>
                                        </div>
                                    </Button>
                                    
                                    <div className={cn(
                                        "absolute right-2 z-10",
                                        "opacity-100" 
                                    )}>
                                        <DropdownMenu 
                                            open={openMenuId === session.id} 
                                            onOpenChange={(open) => setOpenMenuId(open ? session.id : null)}
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="end" 
                                                className="w-48 bg-zinc-950 border-white/10 text-white z-[100]"
                                                sideOffset={5}
                                            >
                                                <DropdownMenuItem onClick={() => handleRenameClick(session)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                    <Pencil className="mr-2 h-3.5 w-3.5 text-white/70" />
                                                    <span>Rename</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => togglePinSession(session.id, !session.isPinned)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {session.isPinned ? (
                                                        <>
                                                            <PinOff className="mr-2 h-3.5 w-3.5 text-white/70" />
                                                            <span>Unpin</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pin className="mr-2 h-3.5 w-3.5 text-white/70" />
                                                            <span>Pin</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem 
                                                    onClick={() => onDeleteSession(session.id)}
                                                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="px-3 py-4 border-t border-white/10 space-y-2">
                    <Button
                        onClick={onLogout}
                        variant="ghost"
                        className="w-full justify-start gap-2 text-white/70 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </Button>
                </div>
            </div>

            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                        <DialogDescription className="text-white/50">
                            Enter a new name for this conversation.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRenameSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="col-span-3 bg-zinc-900 border-white/10 text-white focus-visible:ring-white/20"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsRenameDialogOpen(false)} className="hover:bg-white/10 hover:text-white">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-white text-black hover:bg-white/90">
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
