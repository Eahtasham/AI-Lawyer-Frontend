"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/custom/landing-page";

export default function Home() {
  const router = useRouter();

  const handleStartChat = (query?: string) => {
    // Redirect to login/signup page as requested
    // If a query is provided, we could store it in local storage or query params, 
    // but for now simple redirection is requested.
    router.push("/login");
  };

  return (
    <LandingPage onStartChat={handleStartChat} />
  );
}
