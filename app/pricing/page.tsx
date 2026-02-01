"use client";

import { Button } from "@/components/ui/button";

import { Check } from "lucide-react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContactModal } from "@/components/custom/contact-modal";



export default function PricingPage() {
  const router = useRouter();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");



  
  const handleContact = (plan: string) => {
    if (plan === "Free") {
        router.push("/login");
        return;
    }
    setSelectedPlan(`${plan} Plan`);
    setIsContactOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <Link href="/" className="flex items-center space-x-2">
                      <Scale className="w-6 h-6" />
                      <span className="font-bold text-lg tracking-tight">Samvidhaan</span>
                  </Link>
                  <div className="flex space-x-4">
                     {/* Back button removed */}
                  </div>
              </div>
          </div>
      </nav>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Pricing</h1>
            <p className="text-muted-foreground text-sm">“Our team will help you choose the right setup and onboard you quickly.”</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* FREE Plan */}
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">FREE</h3>
                <p className="text-muted-foreground text-sm mb-6">Perfect for individuals and students starting legal research.</p>
                <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                    onClick={() => handleContact("Free")}
                >
                    Start for Free
                </Button>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <div className="space-y-4 flex-1">
                <p className="text-sm font-medium mb-4">Get started with:</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Access to all Indian Laws</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 3 Case Searches / month</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Basic Legal AI Summaries</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Web Support Community</li>
                </ul>
              </div>
            </div>

            {/* PRO Plan */}
            <div className="rounded-xl border border-primary bg-card p-8 flex flex-col relative box-border ring-1 ring-primary shadow-lg shadow-primary/10 transform scale-105 z-20 transition-all duration-300 hover:shadow-2xl hover:scale-110">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap z-30">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">PRO</h3>
                <p className="text-muted-foreground text-sm mb-6">For professional lawyers and serious researchers.</p>
                <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleContact("Pro")}
                >
                    Upgrade now
                </Button>
              </div>
              <div className="mb-8">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <span className="text-4xl font-bold">$20</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <div className="space-y-4 flex-1">
                <p className="text-sm font-medium mb-4">Everything in the Free Plan, plus:</p>
                <ul className="space-y-3 text-sm">
                   <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Unlimited Case Research</li>
                   <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Advanced Judgment Analysis</li>
                   <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Download PDF Reports</li>
                   <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Citation Analysis</li>
                   <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Priority Email Support</li>
                </ul>
              </div>
            </div>

            {/* TEAM Plan */}
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">TEAM</h3>
                <p className="text-muted-foreground text-sm mb-6">Collaborate with your legal team effectively.</p>
                <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                    onClick={() => handleContact("Team")}
                >
                    Upgrade now
                </Button>
              </div>
              <div className="mb-8">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <span className="text-4xl font-bold">$200</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <div className="space-y-4 flex-1">
                <p className="text-sm font-medium mb-4">Everything in the Pro Plan, plus:</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Unlimited Case Research for 15 Users</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Team Collaboration Tools</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Centralized Billing & Admin</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Shared Case Folders</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Priority Phone Support</li>
                </ul>
              </div>
            </div>

             {/* ENTERPRISE Plan */}
             <div className="rounded-xl border border-border bg-card p-8 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">ENTERPRISE</h3>
                <p className="text-muted-foreground text-sm mb-6">For large law firms and organizations needing premium support.</p>
                <Button 
                    variant="outline" 
                    className="w-full border-muted-foreground text-foreground hover:bg-muted bg-transparent"
                    onClick={() => handleContact("Enterprise")}
                >
                    Contact Us
                </Button>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <div className="space-y-4 flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Dedicated Personal Support</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Custom workflows for large law firms</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Share insights across teams and departments</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Role-based access for partners & associates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <ContactModal open={isContactOpen} onOpenChange={setIsContactOpen} planName={selectedPlan} />
      </main>

      <footer id="coverage" className="bg-white dark:bg-background border-t border-neutral-200 dark:border-neutral-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Scale className="w-5 h-5 text-neutral-900 dark:text-white" />
                <span className="font-semibold text-neutral-900 dark:text-white">Samvidhaan</span>
                <span className="text-neutral-500 mx-2">•</span>
                <span className="text-neutral-500">Built for Indian Law.</span>
            </div>

            <div className="flex items-center space-x-6 text-neutral-600 dark:text-neutral-400">
                <a href="#" className="hover:text-black dark:hover:text-white transition-colors">GitHub</a>
                <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
                <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Report Issue</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

