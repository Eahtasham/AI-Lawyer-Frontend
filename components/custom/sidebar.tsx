import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Home, LogOut, MoreHorizontal, Pin, PinOff, Pencil, PanelLeftClose, PanelLeftOpen, Settings, User as UserIcon, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
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
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsModal } from "./settings-modal";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onLogout: () => void;
    user?: User | null;
}

export function Sidebar({
    className,
    sessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onLogout,
    user
}: SidebarProps) {
    const { renameSession, togglePinSession } = useChatStore();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Auto-collapse on small screens if needed, or rely on parent hiding it.
    // For this implementation, we allow manual toggle.

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

    const sortedSessions = sessions
        .filter(session => session.isPinned || (session.messages && session.messages.length > 0))
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.updatedAt - a.updatedAt;
        });

    const userInitials = user?.email?.substring(0, 2).toUpperCase() || "AI";

    return (
        <TooltipProvider delayDuration={0}>
        <>
            <div 
                className={cn(
                    "flex flex-col h-screen bg-zinc-950 border-r border-white/10 transition-all duration-300 ease-in-out relative",
                    isCollapsed ? "w-[70px]" : "w-[300px]",
                    className
                )}
            >
                {/* Header */}
                <div className={cn(
                    "flex h-16 items-center border-b border-white/10 shrink-0",
                    isCollapsed ? "justify-center" : "justify-between px-4"
                )}>
                    {!isCollapsed ? (
                        <>
                            <Link href="/" className="flex items-center gap-2 font-semibold text-white tracking-tight">
                                <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center">
                                    <Home className="h-5 w-5" />
                                </div>
                                <span>SamVidhaan AI</span>
                            </Link>
                            <Button
                                variant="ghost" 
                                size="icon"
                                onClick={() => setIsCollapsed(true)}
                                className="text-white/50 hover:text-white hover:bg-white/10"
                            >
                                <PanelLeftClose className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <div 
                            className="group relative flex h-10 w-10 items-center justify-center cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setIsCollapsed(false)}
                        >
                            {/* Home Icon: Visible by default, hidden on hover */}
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0">
                                <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center">
                                    <Home className="h-5 w-5" />
                                </div>
                            </div>
                            
                            {/* Expand Icon: Hidden by default, visible on hover */}
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 text-white">
                                <PanelLeftOpen className="h-5 w-5" />
                            </div>
                        </div>
                    )}
                </div>

                {/* New Chat Button */}
                <div className="p-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onNewChat}
                                className={cn(
                                    "w-full justify-start gap-2 bg-zinc-900 text-white hover:bg-zinc-800 border border-white/10 shadow-sm transition-all",
                                    isCollapsed && "justify-center px-0 h-10 w-10 mx-auto rounded-xl"
                                )}
                            >
                                <Plus className={cn("h-5 w-5", isCollapsed ? "" : "mr-1")} />
                                {!isCollapsed && "New Chat"}
                            </Button>
                        </TooltipTrigger>
                       {isCollapsed && <TooltipContent side="right">New chat</TooltipContent>}
                    </Tooltip>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full px-3">
                        {!isCollapsed && (
                            <h2 className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                                Recent Activity
                            </h2>
                        )}
                        <div className="space-y-1">
                            {sortedSessions.map((session) => (
                                <div 
                                    key={session.id} 
                                    className={cn(
                                        "group flex items-center w-full rounded-md transition-all duration-200 focus-within:bg-zinc-800/50",
                                        "hover:bg-zinc-800/50",
                                        currentSessionId === session.id ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400"
                                    )}
                                >
                                    {/* Primary Action Button (Title + Navigation) */}
                                    <div className="flex-1 min-w-0 relative">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    onClick={() => onSelectSession(session.id)}
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full h-auto py-2 px-2 hover:bg-transparent justify-start gap-2 font-normal transition-none",
                                                        isCollapsed && "justify-center px-0",
                                                        currentSessionId === session.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                                    )}
                                                >
                                                    {/* Icon State */}
                                                    {session.isPinned && (
                                                        <Pin className={cn(
                                                            "h-3.5 w-3.5 shrink-0 text-amber-500/90",
                                                            isCollapsed ? "mx-auto" : ""
                                                        )} />
                                                    )}
                                                    
                                                    {!session.isPinned && isCollapsed && (
                                                        <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                                                    )}

                                                    {/* Text Content (Expanded only) */}
                                                    {!isCollapsed && (
                                                        <span className="truncate text-sm">
                                                            {(session.title || "New Chat").length > 30 
                                                                ? (session.title || "New Chat").slice(0, 30) + "..." 
                                                                : (session.title || "New Chat")}
                                                        </span>
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            
                                            {/* Tooltip (Collapsed only) */}
                                            {isCollapsed && (
                                                <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                    {session.title || "New Chat"}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </div>

                                    {/* Secondary Actions (Menu) - Expanded Only */}
                                    {!isCollapsed && (
                                        <div className={cn(
                                            "shrink-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity",
                                            openMenuId === session.id ? "opacity-100" : ""
                                        )}>
                                            <DropdownMenu 
                                                open={openMenuId === session.id} 
                                                onOpenChange={(open) => setOpenMenuId(open ? session.id : null)}
                                            >
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200">
                                                    <DropdownMenuItem onClick={() => handleRenameClick(session)} className="focus:bg-zinc-800 cursor-pointer">
                                                        <Pencil className="mr-2 h-3.5 w-3.5" />
                                                        <span>Rename</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => togglePinSession(session.id, !session.isPinned)} className="focus:bg-zinc-800 cursor-pointer">
                                                        {session.isPinned ? (
                                                            <>
                                                                <PinOff className="mr-2 h-3.5 w-3.5" />
                                                                <span>Unpin</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Pin className="mr-2 h-3.5 w-3.5" />
                                                                <span>Pin</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem 
                                                        onClick={() => onDeleteSession(session.id)}
                                                        className="text-red-400 focus:text-red-400 focus:bg-red-950/20 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer / User Profile */}
                <div className="p-3 mt-auto border-t border-white/10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full h-auto p-2 hover:bg-white/10 transition-colors",
                                    isCollapsed ? "justify-center" : "justify-start gap-3"
                                )}
                            >
                                <Avatar className="h-8 w-8 border border-white/20 rounded-lg">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-zinc-800 text-white rounded-lg text-xs">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                
                                {!isCollapsed && (
                                    <>
                                        <div className="flex flex-col items-start truncate text-left flex-1 min-w-0">
                                            <span className="text-sm font-medium text-white truncate w-full">
                                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                                            </span>
                                            <span className="text-xs text-white/40 truncate w-full">
                                                {user?.email || ""}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="h-4 w-4 text-white/40 shrink-0" />
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            side="right" 
                            align="end" 
                            sideOffset={10}
                            className="w-56 bg-zinc-950 border-white/10 text-white p-1"
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}</p>
                                    <p className="text-xs leading-none text-white/50">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="focus:bg-white/10 cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span className="text-white">Account Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

            <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} user={user || null} />
        </>
        </TooltipProvider>
    );
}

// Add a default export to match possible imports
export default Sidebar;
