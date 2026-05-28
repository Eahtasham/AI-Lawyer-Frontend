import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnalyzeClient from "./analyze-client";

export default async function AnalyzePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return <AnalyzeClient accessToken={session.access_token} />;
}
