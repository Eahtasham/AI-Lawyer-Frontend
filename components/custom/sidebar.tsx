import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Home, MoreHorizontal, Pin, PinOff, Pencil, PanelLeftClose, PanelLeftOpen, Loader2, X, Scale } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserProfileDropdown } from '@/components/custom/user-profile-dropdown';
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
import { User } from "@supabase/supabase-js";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    sessions: ChatSession[];
    currentSessionId: string | null;
    user: User | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onLogout: () => void;
    onOpenSettings: () => void;
    profile?: { username: string; full_name: string; avatar_url: string } | null;
    onCloseMobile?: () => void;
}

export function Sidebar({
    className,
    sessions,
    currentSessionId,
    user,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onLogout,
    onOpenSettings,
    profile,
    onCloseMobile
}: SidebarProps) {
    const { renameSession, togglePinSession } = useChatStore();
    const touchTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        }

        if (isExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isExpanded]);

    const handleTouchStart = (sessionId: string) => {
        touchTimerRef.current = setTimeout(() => {
            setOpenMenuId(sessionId);
        }, 600);
    };

    const handleTouchEnd = () => {
        if (touchTimerRef.current) {
            clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
        }
    };

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
                        "flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900 border-r border-sidebar-border transition-all duration-300 ease-in-out relative",
                        isCollapsed ? "w-[70px]" : "w-[260px]",
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
                                    <div className="h-9 w-9 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    {/* <span>Samvidhaan</span> - User requested removal */}
                                </Link>
                                {onCloseMobile && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onCloseMobile}
                                        className="h-8 w-8 md:hidden text-muted-foreground hover:text-sidebar-foreground"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCollapsed(true)}
                                    className="hidden md:flex text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                >
                                    <div className="flex items-center justify-center text-sidebar-foreground">
                                        <PanelLeftClose className="h-6 w-6" />
                                    </div>
                                </Button>
                            </>
                        ) : (
                            <div
                                className="group relative flex h-10 w-10 items-center justify-center cursor-pointer rounded-lg hover:bg-sidebar-accent transition-colors"
                                onClick={() => setIsCollapsed(false)}
                            >
                                {/* Home Icon: Visible by default, hidden on hover */}
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0">
                                    <div className="h-10 w-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Expand Icon: Hidden by default, visible on hover */}
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 text-sidebar-foreground">
                                    <PanelLeftOpen className="h-6 w-6" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* New Chat Button */}
                    <div className={cn("p-3", isCollapsed && "p-0 my-2 flex justify-center")}>
                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onNewChat}
                                        className="h-9 w-11 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 border border-sidebar-border shadow-sm p-0 flex items-center justify-center"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">New chat</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                onClick={onNewChat}
                                className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 border border-sidebar-border shadow-sm transition-all"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                New Chat
                            </Button>
                        )}
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
                                        <div className={cn("flex-1 min-w-0 relative", isCollapsed && "flex justify-center w-full")}>
                                            {/* Tooltip wrapper only if collapsed */}
                                            {isCollapsed ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => onSelectSession(session.id)}
                                                            onTouchStart={() => handleTouchStart(session.id)}
                                                            onTouchEnd={handleTouchEnd}
                                                            onTouchMove={handleTouchEnd}
                                                            variant="ghost"
                                                            className={cn(
                                                                "h-9 w-9 rounded-xl p-0 flex items-center justify-center transition-none",
                                                                currentSessionId === session.id ? "bg-sidebar-accent text-sidebar-foreground" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                                            )}
                                                        >
                                                            {session.isPinned && (
                                                                <Pin className="h-4 w-4 shrink-0 text-amber-500/90" />
                                                            )}
                                                            {!session.isPinned && (
                                                                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="bg-popover border-border text-popover-foreground">
                                                        {session.title || "New Chat"}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Button
                                                    onClick={() => onSelectSession(session.id)}
                                                    onTouchStart={() => handleTouchStart(session.id)}
                                                    onTouchEnd={handleTouchEnd}
                                                    onTouchMove={handleTouchEnd}
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full h-auto py-2 px-2 hover:bg-transparent justify-start gap-2 font-normal transition-none",
                                                        currentSessionId === session.id ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                                                    )}
                                                >
                                                    {session.isPinned && (
                                                        <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500/90" />
                                                    )}
                                                    <span className="truncate text-sm">
                                                        {(session.title || "New Chat").length > 30
                                                            ? (session.title || "New Chat").slice(0, 18) + "..."
                                                            : (session.title || "New Chat")}
                                                    </span>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Secondary Actions (Menu) - Expanded Only - Hidden on Mobile (Touch Long Press uses logic) */}
                                        {!isCollapsed && (
                                            <div className={cn(
                                                "shrink-0 flex items-center justify-center transition-opacity",
                                                "md:w-8 w-0 overflow-hidden", // Hidden width on mobile but exists for anchor
                                                "opacity-0 md:group-hover:opacity-100 focus-within:opacity-100",
                                                openMenuId === session.id ? "opacity-100 md:w-8" : "" // Expand width ONLY on desktop if open 
                                                // If we make it w-8 when open, it might shift layout. 
                                                // Actually, if it's open via Long Press on mobile, we might WANT it to appear?
                                                // User said "hide/remove ... menu on mobile".
                                                // If I keep it w-0, the menu spawns at the cut.
                                                // Let's keep w-0 on mobile even if open, unless that breaks positioning too much.
                                                // But wait, if opacity-100 is set, it becomes visible?
                                                // If w-0, content is hidden by overflow-hidden.
                                                // So it remains invisible.
                                                // But the DropdownContent is in a Portal usually? 
                                                // Radix DropdownContent is portaled by default. So it will show even if parent is overflow-hidden.
                                                // Perfect.
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

                    {/* User Profile - Fixed at Bottom - Only Desktop (hidden md:flex to match parent visibility but actually the parent is hidden on mobile, 
                     wait, the parent sidebar is 'hidden md:flex' in desktop mode, but this component is also used in mobile sheet.
                     The user requirement: "only on the top right for mobile devices". 
                     So this section should be hidden when used in the Mobile Sheet?
                     The Mobile Sheet renders this Sidebar component.
                     We can detect if we are in mobile sheet? Or just use "hidden md:flex" so it only shows on larger screens?
                     The Mobile Sheet uses this component, if we hide it on mobile breakpoint, it will vanish on mobile screens.
                     Since the Mobile Sheet uses this component, if we hide it on mobile breakpoint, it won't show in the sheet. 
                     That matches "only on the top right for mobile devices" (i.e. NOT in the sidebar/sheet).
                     BUT, user profile WAS at bottom before.
                    */}
                    <div className="border-t border-sidebar-border hidden md:block w-full">
                        <div
                            ref={userMenuRef}
                            className={cn(
                                "flex flex-col w-full transition-all duration-300 ease-in-out",
                                isExpanded ? "bg-sidebar-accent/10" : "hover:bg-sidebar-accent/0"
                            )}
                        >
                            {isCollapsed ? (
                                <UserProfileDropdown
                                    user={user}
                                    profile={profile || null}
                                    onLogout={onLogout}
                                    onOpenSettings={onOpenSettings}
                                    side="right"
                                    align="end"
                                    className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                                    trigger={
                                        <button className="flex items-center justify-center w-11 h-11 mx-auto rounded-xl p-1 focus:outline-none transition-colors hover:bg-sidebar-accent outline-none my-3">
                                            <Avatar className="h-9 w-9 shrink-0">
                                                <AvatarImage src={profile?.avatar_url} /> // or optionally user?.user_metadata?.avatar_url
                                                <AvatarFallback className="text-xs rounded-xl">{user?.email?.substring(0, 2).toUpperCase() || "AI"}</AvatarFallback>
                                            </Avatar>
                                        </button>
                                    }
                                />
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center gap-3 w-full p-4 text-left focus:outline-none outline-none"
                                    >
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                                            <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase() || "AI"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start truncate min-w-0 flex-1">
                                            <span className="text-sm font-medium truncate w-full">{profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}</span>
                                            <span className="text-xs text-muted-foreground truncate w-full">@{profile?.username || user?.email?.split('@')[0]}</span>
                                        </div>
                                        <div className="ml-auto shrink-0 text-muted-foreground">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")}
                                            >
                                                <path d="m18 15-6-6-6 6" />
                                            </svg>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pb-2 space-y-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-10 px-4 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 rounded-none pl-12"
                                                        onClick={() => {
                                                            setIsExpanded(false);
                                                            onOpenSettings();
                                                        }}
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Settings
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-10 px-4 text-sm font-normal text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-none pl-12"
                                                        onClick={onLogout}
                                                    >
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        Log out
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>
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
