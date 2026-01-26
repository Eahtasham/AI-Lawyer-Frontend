"use client"

import * as React from "react"
import { LogOut, Settings } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Profile {
    username?: string;
    full_name?: string;
    avatar_url?: string;
}

interface UserProfileDropdownProps {
    user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
    profile: Profile | null;
    trigger: React.ReactNode;
    onOpenSettings: () => void;
    onLogout: () => void;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    className?: string;
    sideOffset?: number;
}

export function UserProfileDropdown({
    user,
    profile,
    trigger,
    onOpenSettings,
    onLogout,
    side = "right",
    align = "end",
    className,
    sideOffset = 4
}: UserProfileDropdownProps) {
    // Determine display names
    const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
    const username = profile?.username || user?.email?.split('@')[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side={side}
                align={align}
                sideOffset={sideOffset}
                className={cn("w-56 bg-popover border-border text-popover-foreground", className)}
            >
                <DropdownMenuLabel className="font-normal px-2 py-1.5 cursor-pointer" onClick={onOpenSettings}>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">@{username}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onLogout}
                    className="text-red-500 focus:text-red-500 hover:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
