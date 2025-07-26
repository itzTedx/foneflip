"use client";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { useState } from "react";

import { getCacheMonitorData } from "./server";

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  averageResponseTime: number;
  cacheSize: number;
  memoryUsage: string;
  evictedKeys: number;
  uptimeSeconds: number;
  peakMemoryUsage: string;
  maxMemoryPolicy: string;
}

interface CacheInsights {
  performance: string;
  recommendations: string[];
}

export default function CacheMonitorPage() {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [insights, setInsights] = useState<CacheInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCacheMonitorData();
      setMetrics({
        evictedKeys: 0,
        uptimeSeconds: 0,
        peakMemoryUsage: "unknown",
        maxMemoryPolicy: "unknown",
        ...data.metrics,
      });
      setInsights(data.insights);
    } catch {
      setError("Failed to load cache metrics");
    } finally {
      setLoading(false);
    }
  }



  return (
    <MainWrapper className="px-6">
      <h1 className="mb-2 text-3xl font-bold">Cache Monitoring Dashboard</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : metrics && insights ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">{metrics.hitRate}%</div>
              <div className="text-gray-500">Hit Rate</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">{metrics.missRate}%</div>
              <div className="text-gray-500">Miss Rate</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {metrics.totalRequests}
              </div>
              <div className="text-gray-500">Total Requests</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {metrics.averageResponseTime}ms
              </div>
              <div className="text-gray-500">Avg. Response Time</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">{metrics.cacheSize}</div>
              <div className="text-gray-500">Cache Size</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {metrics.memoryUsage}
              </div>
              <div className="text-gray-500">Memory Usage</div>
            </div>
            {/* New enterprise metrics */}
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {metrics.evictedKeys}
              </div>
              <div className="text-gray-500">Evicted Keys</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {metrics.peakMemoryUsage}
              </div>
              <div className="text-gray-500">Peak Memory Usage</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {metrics.maxMemoryPolicy}
              </div>
              <div className="text-gray-500">Eviction Policy</div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <div className="text-2xl font-semibold">
                {Math.floor(metrics.uptimeSeconds / 3600)}h{" "}
                {Math.floor((metrics.uptimeSeconds % 3600) / 60)}m
              </div>
              <div className="text-gray-500">Cache Uptime</div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <div className="mb-2 text-xl font-semibold">
              Performance: {insights.performance}
            </div>
            {insights.recommendations.length > 0 ? (
              <ul className="list-disc pl-5">
                {insights.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            ) : (
              <div>No recommendations. Cache is performing well!</div>
            )}
          </div>
        </div>
      ) : null}
    </MainWrapper>
  );
}
