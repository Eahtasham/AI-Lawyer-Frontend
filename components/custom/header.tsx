"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { Scale } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-montserrat font-bold text-xl">
                    <Scale className="h-6 w-6" />
                    <span>AI Lawyer</span>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/chat">
                        <Button>Start Chat</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
