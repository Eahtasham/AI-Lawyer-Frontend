"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ShieldCheck,
  Target,
  Zap,
  Play,
  Terminal,
} from "lucide-react";
import Link from "next/link";

interface RagMetric {
  id: string;
  context_precision: number;
  faithfulness: number;
  relevance: number;
  chunk_coverage: number;
  model_used: string;
  latency_ms: number;
  created_at: string;
}

interface BenchmarkRun {
  id: string;
  model_name: string;
  avg_relevance: number;
  avg_faithfulness: number;
  avg_context_precision: number;
  avg_latency_ms: number;
  created_at: string;
}

export default function EvalDashboard() {
  const [metrics, setMetrics] = useState<RagMetric[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const fetchData = async () => {
    try {
      const metRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluation/metrics`
      );
      const metData = await metRes.json();
      setMetrics(metData.data || []);

      const benRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluation/benchmark`
      );
      const benData = await benRes.json();
      setBenchmarks(benData.data || []);
    } catch (e) {
      console.error("Failed to fetch evaluation metrics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setLogs([]);
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluation/run-benchmark`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        setIsBenchmarking(false);
        fetchData();
      } else {
        setLogs((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
      setIsBenchmarking(false);
    };
  };

  const benchmarkChartData = benchmarks.map((b) => ({
    name: b.model_name,
    Relevance: Math.round(b.avg_relevance * 100),
    Faithfulness: Math.round(b.avg_faithfulness * 100),
    Precision: Math.round(b.avg_context_precision * 100),
  }));

  const timelineData = metrics
    .slice()
    .reverse()
    .map((m, i) => ({
      name: `Query ${i + 1}`,
      Relevance: Math.round(m.relevance * 100),
      Faithfulness: Math.round(m.faithfulness * 100),
      Latency: m.latency_ms,
    }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          RAG Evaluation Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Link
            href="/chat"
            className="text-blue-500 hover:underline text-sm font-medium">
            Back to Chat
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Self Evaluation</TabsTrigger>
          <TabsTrigger value="benchmarks">Model Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Relevance
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length
                    ? Math.round(
                        (metrics.reduce((acc, m) => acc + m.relevance, 0) /
                          metrics.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Faithfulness
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length
                    ? Math.round(
                        (metrics.reduce((acc, m) => acc + m.faithfulness, 0) /
                          metrics.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Context Precision
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length
                    ? Math.round(
                        (metrics.reduce(
                          (acc, m) => acc + m.context_precision,
                          0
                        ) /
                          metrics.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Latency
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length
                    ? Math.round(
                        metrics.reduce(
                          (acc, m) => acc + (m.latency_ms || 0),
                          0
                        ) / metrics.length
                      )
                    : 0}
                  ms
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Session Metric Trends</CardTitle>
                <CardDescription>
                  Relevance & Faithfulness across recent queries
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Relevance"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Faithfulness"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Latency Trends</CardTitle>
                <CardDescription>Response time per query (ms)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="Latency"
                        stroke="#ffc658"
                        fill="#ffc658"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button onClick={handleRunBenchmark} disabled={isBenchmarking}>
              <Play className="h-4 w-4 mr-2" />
              {isBenchmarking
                ? "Running Benchmark..."
                : "Run Evaluation Benchmark"}
            </Button>
          </div>

          {isBenchmarking || logs.length > 0 ? (
            <Card className="mb-4 bg-muted/50">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Terminal className="h-4 w-4 mr-2" /> Live Console Stream
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="bg-black text-green-400 font-mono text-xs rounded-md p-4 h-64 overflow-y-auto whitespace-pre-wrap flex flex-col">
                  {logs.map((l, i) => (
                    <span key={i}>{l === "" ? "\\n" : l}</span>
                  ))}
                  {isBenchmarking && <span className="animate-pulse">_</span>}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Model Comparisons</CardTitle>
              <CardDescription>
                Samvidhaan Council vs Base Models (Based on Indian Legal Bench)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={benchmarkChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Relevance"
                      dataKey="Relevance"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Faithfulness"
                      dataKey="Faithfulness"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Precision"
                      dataKey="Precision"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
