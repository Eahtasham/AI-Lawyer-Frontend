import React, { useState } from 'react';
import { Shield, Book, Search, Scale, ChevronRight, CheckCircle2, Plus, ArrowRight, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface LandingPageProps {
    onStartChat: (query?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
    const [heroInput, setHeroInput] = useState('');

    const exampleQueries = [
        "Can a writ under Art 226 be filed against an interlocutory order?",
        "Difference between certiorari and supervisory jurisdiction (Art 227)",
        "When does Section 115 CPC revision lie after 1999 amendment?",
        "What is the ratio of Surya Dev Rai v. Ram Chander Rai?"
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-background text-neutral-900 dark:text-neutral-50 transition-colors duration-200 font-sans">

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Scale className="w-6 h-6" />
                            <span className="font-bold text-lg tracking-tight">Samvidhaan</span>
                        </div>
                        <div className="hidden md:flex space-x-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
                            <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</a>
                            <a href="#coverage" className="hover:text-black dark:hover:text-white transition-colors">Coverage</a>
                            <a href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
                        </div>
                        <Button size="sm" onClick={() => onStartChat()}>Try Demo</Button>
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 dark:bg-card text-neutral-600 dark:text-neutral-300 text-xs font-medium mb-8 border border-neutral-200 dark:border-neutral-700">
                            <Shield className="w-3 h-3 mr-2" />
                            Indian Laws & Court Judgments
                        </div>

                        {/* Headline - Crisp */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-white leading-tight">
                            Precision Legal Research <br /> for Indian Law
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 max-w-xl mx-auto leading-relaxed">
                            Instant answers grounded in the Constitution, Statutes, and Supreme Court Judgments.
                        </p>

                        {/* Input Box - Matches Image */}
                        <div className="max-w-2xl mx-auto mb-12">
                            <form
                                onSubmit={(e) => { e.preventDefault(); onStartChat(heroInput); }}
                                className="relative group"
                            >
                                <div className="relative flex items-center w-full h-14 rounded-full bg-neutral-100 dark:bg-card transition-all border border-transparent hover:shadow-md">
                                    {/* Left Icon */}
                                    <button type="button" className="pl-5 pr-3 text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </button>

                                    {/* Input */}
                                    <input
                                        type="text"
                                        placeholder="Ask anything"
                                        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-neutral-900 dark:text-white placeholder-neutral-500 text-lg h-full"
                                        value={heroInput}
                                        onChange={(e) => setHeroInput(e.target.value)}
                                    />

                                    {/* Right Icons */}
                                    <div className="flex items-center pr-2 space-x-2">
                                        <button
                                            type="submit"
                                            disabled={!heroInput.trim()}
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Why This Exists - Updated Heading and Background */}
                <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold mb-10 text-center dark:text-white">The Legal Research Gap</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Judgment Overload", desc: "Reading 200-page judgments just to extract one specific legal principle." },
                                { title: "Procedural Confusion", desc: "Clarifying complexities like Article 226 vs 227 or Section 115 CPC revisions." },
                                { title: "Unverified Answers", desc: "Avoiding generic AI answers that lack proper case law grounding." },
                                { title: "Context & Ratio", desc: "Distinguishing between Obiter Dicta and Ratio Decidendi in research." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-card p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                    <h3 className="font-semibold text-lg mb-3 dark:text-white">{item.title}</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Differentiators - Uniform Background */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 dark:text-white">Built for Correctness,<br />Not Conversation.</h2>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                                    Most AI models treat law as creative writing. We treat it as a database of constraints.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { title: "Case-Law First", desc: "Answers derived from ratio decidendi, not raw text matching." },
                                        { title: "Indian Jurisdiction Locked", desc: "Trained exclusively on Indian Acts and Supreme Court Judgments." },
                                        { title: "Citation Backed", desc: "Every response references the specific Act or Case Law." },
                                        { title: "Zero Hallucination Policy", desc: "The system refuses to answer if legal grounding is insufficient." }
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center flex-shrink-0 mt-1">
                                                <CheckCircle2 className="w-3 h-3 text-white dark:text-black" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold dark:text-white">{feat.title}</h4>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{feat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-neutral-100 dark:bg-card rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 relative">
                                {/* Abstract UI representation */}
                                <div className="absolute top-4 right-4 flex space-x-1">
                                    <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                                    <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                                </div>
                                <div className="space-y-4 mt-4">
                                    <div className="bg-white dark:bg-[#252525] p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-mono text-xs text-neutral-400 mb-2">QUERY ANALYSIS</p>
                                        <p className="font-medium dark:text-white">&ldquo;Can a writ be filed against private body?&rdquo;</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <ChevronRight className="rotate-90 text-neutral-400" />
                                    </div>
                                    <div className="bg-white dark:bg-[#252525] p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                                        <p className="font-mono text-xs text-neutral-400 mb-2">RETRIEVAL</p>
                                        <p className="text-sm dark:text-neutral-300">Found: <i>Zee Telefilms Ltd. v. Union of India (2005)</i></p>
                                        <p className="text-sm dark:text-neutral-300">Found: <i>Art 12, Constitution of India</i></p>
                                    </div>
                                    <div className="flex justify-center">
                                        <ChevronRight className="rotate-90 text-neutral-400" />
                                    </div>
                                    <div className="bg-white dark:bg-[#252525] p-4 rounded-lg shadow-sm border-l-4 border-neutral-900 dark:border-white">
                                        <p className="font-mono text-xs text-neutral-400 mb-2">GENERATED RESPONSE</p>
                                        <p className="text-sm leading-relaxed dark:text-neutral-300">
                                            Generally, a writ under Article 226 lies against the State (Art 12). However, in <i>Zee Telefilms</i>, the Supreme Court held that if a private body performs public functions...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Example Queries - Uniform Background */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold mb-10 text-center dark:text-white">What Can You Ask?</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {exampleQueries.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => onStartChat(q)}
                                    className="text-left p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card hover:border-neutral-400 dark:hover:border-neutral-600 transition-all group shadow-sm"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-neutral-800 dark:text-neutral-200 pr-4">{q}</span>
                                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works - Uniform Background */}
                <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold mb-16 text-center dark:text-white">How It Works</h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { icon: Search, title: "1. Query Analysis", desc: "Intent & jurisdiction detection." },
                                { icon: Book, title: "2. Law Retrieval", desc: "Fetching strict statutes & principles." },
                                { icon: FileText, title: "3. Reasoning", desc: "Synthesizing answer from retrieved acts." },
                                { icon: Scale, title: "4. Citation", desc: "Adding references for verification." },
                            ].map((step, i) => (
                                <div key={i} className="text-center relative group">
                                    <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-card rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="w-8 h-8 text-neutral-700 dark:text-neutral-300" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 dark:text-white">{step.title}</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.desc}</p>

                                    {/* Connector line for desktop */}
                                    {i < 3 && (
                                        <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 -z-10" style={{ marginLeft: '50%' }}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Coverage & Footer - Sleek Single Row */}
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

            </main>
        </div>
    );
};
