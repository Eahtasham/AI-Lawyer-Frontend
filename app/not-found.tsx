import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
            <h2 className="mb-4 text-4xl font-bold font-montserrat">404</h2>
            <p className="mb-8 text-lg text-muted-foreground">Page not found</p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    );
}
