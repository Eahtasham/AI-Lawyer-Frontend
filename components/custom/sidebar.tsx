import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Home, MoreHorizontal, Pin, PinOff, Pencil, PanelLeftClose, PanelLeftOpen, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/lib/store/chat-store";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
}

export function Sidebar({
    className,
    sessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession
}: SidebarProps) {
    const { renameSession, togglePinSession } = useChatStore();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            setIsRenaming(true);
            try {
                await renameSession(sessionToRename.id, newTitle.trim());
                setIsRenameDialogOpen(false);
                setSessionToRename(null);
            } finally {
                setIsRenaming(false);
            }
        }
    };

    const handleDeleteClick = (sessionId: string) => {
        setSessionToDelete(sessionId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (sessionToDelete) {
             setIsDeleting(true);
             try {
                await onDeleteSession(sessionToDelete);
             } finally {
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
                setSessionToDelete(null);
             }
        }
    };

    const sortedSessions = sessions
        .filter(session => session.isPinned || (session.messages && session.messages.length > 0))
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.updatedAt - a.updatedAt;
        });



    return (
        <TooltipProvider delayDuration={0}>
            <>
                <div
                    className={cn(
                        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out relative",
                        isCollapsed ? "w-[70px]" : "w-[300px]",
                        className
                    )}
                >
                    {/* Header */}
                    <div className={cn(
                        "flex h-16 items-center border-b border-sidebar-border shrink-0",
                        isCollapsed ? "justify-center" : "justify-between px-4"
                    )}>
                        {!isCollapsed ? (
                            <>
                                <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground tracking-tight">
                                    <div className="h-8 w-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    <span>SamVidhaan AI</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCollapsed(true)}
                                    className="hidden md:flex text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                >
                                    <PanelLeftClose className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <div
                                className="group relative flex h-10 w-10 items-center justify-center cursor-pointer rounded-lg hover:bg-sidebar-accent transition-colors"
                                onClick={() => setIsCollapsed(false)}
                            >
                                {/* Home Icon: Visible by default, hidden on hover */}
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0">
                                    <div className="h-8 w-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                                        <Home className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Expand Icon: Hidden by default, visible on hover */}
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 text-sidebar-foreground">
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
                                        "w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 border border-sidebar-border shadow-sm transition-all",
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
                                <h2 className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                    Recent Activity
                                </h2>
                            )}
                            <div className="space-y-1">
                                {sortedSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "group flex items-center w-full rounded-md transition-all duration-200 focus-within:bg-sidebar-accent/50",
                                            "hover:bg-sidebar-accent/50",
                                            currentSessionId === session.id ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-muted-foreground"
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
                                                            currentSessionId === session.id ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
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
                                                    <TooltipContent side="right" className="bg-popover border-border text-popover-foreground">
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
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-popover border-border text-popover-foreground">
                                                        <DropdownMenuItem onClick={() => handleRenameClick(session)} className="focus:bg-sidebar-accent cursor-pointer">
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            <span>Rename</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => togglePinSession(session.id, !session.isPinned)} className="focus:bg-sidebar-accent cursor-pointer">
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
                                                        <DropdownMenuSeparator className="bg-border" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(session.id)}
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

                </div>

                <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-popover text-popover-foreground border-border">
                        <DialogHeader>
                            <DialogTitle>Rename Chat</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
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
                                        className="col-span-3 bg-secondary border-border text-foreground focus-visible:ring-ring"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <DialogFooter className="flex-row justify-end space-x-2">
                                <Button type="button" variant="ghost" onClick={() => setIsRenameDialogOpen(false)} className="hover:bg-secondary hover:text-secondary-foreground" disabled={isRenaming}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isRenaming}>
                                    {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="bg-popover border-border text-popover-foreground">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                                This action cannot be undone. This will permanently delete your conversation history.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-border hover:bg-secondary hover:text-secondary-foreground text-popover-foreground">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-red-500 text-white hover:bg-red-600 border-none"
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </>
        </TooltipProvider>
    );
}

// Add a default export to match possible imports
export default Sidebar;
