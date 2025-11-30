"use client";

import {
    Scale,
    Gavel,
    FileText,
    Search,
    Users,
    ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
    {
        title: "Council of 5 AI",
        description:
            "Get diverse legal perspectives from 5 specialized AI models analyzing your case simultaneously.",
        icon: Users,
    },
    {
        title: "Case Similarity",
        description:
            "Instantly find relevant precedents and similar past cases to strengthen your legal arguments.",
        icon: Scale,
    },
    {
        title: "Legal Doc Creator",
        description:
            "Draft professional legal documents, contracts, and notices in minutes with AI assistance.",
        icon: FileText,
    },
    {
        title: "Smart Analysis",
        description:
            "Deep dive into legal texts with our advanced analyzer that highlights key clauses and risks.",
        icon: Search,
    },
    {
        title: "Instant Answers",
        description:
            "Get immediate responses to your queries on Hindu Marriage Act, IPC, and other Indian laws.",
        icon: Gavel,
    },
    {
        title: "Secure & Private",
        description:
            "Your legal data is encrypted and handled with the utmost confidentiality and security.",
        icon: ShieldCheck,
    },
];

export function Features() {
    return (
        <section className="container mx-auto px-4 py-24 md:px-8">
            <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-montserrat">
                    Comprehensive Legal Intelligence
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Everything you need to navigate the legal landscape with confidence.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card className="h-full border-border/50 bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:bg-secondary/10">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-montserrat">
                                    {feature.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
