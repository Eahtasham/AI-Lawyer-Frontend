import { Hero } from "@/components/custom/hero";
import { Features } from "@/components/custom/features";
import { Header } from "@/components/custom/header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      <Hero />
      <Features />
    </main>
  );
}
