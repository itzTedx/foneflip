"use client";

import { useState } from "react";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Badge } from "@ziron/ui/badge";
import { Card, CardContent, CardHeader } from "@ziron/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, Line, LineChart, XAxis, YAxis } from "@ziron/ui/chart";
import { cn } from "@ziron/utils";

// E-commerce platform metrics data (adapted from interactive chart example)
const platformData = [
  { date: "2024-04-01", orders: 222, response: 150, revenue: 8.2, customers: 420 },
  { date: "2024-04-02", orders: 97, response: 180, revenue: 4.5, customers: 290 },
  { date: "2024-04-03", orders: 167, response: 120, revenue: 6.8, customers: 380 },
  { date: "2024-04-04", orders: 242, response: 260, revenue: 9.1, customers: 520 },
  { date: "2024-04-05", orders: 301, response: 340, revenue: 11.2, customers: 620 },
  { date: "2024-04-06", orders: 59, response: 110, revenue: 2.8, customers: 180 },
  { date: "2024-04-07", orders: 261, response: 190, revenue: 9.8, customers: 510 },
  { date: "2024-04-08", orders: 327, response: 350, revenue: 12.1, customers: 650 },
  { date: "2024-04-09", orders: 89, response: 150, revenue: 3.8, customers: 220 },
  { date: "2024-04-10", orders: 195, response: 165, revenue: 7.2, customers: 390 },
  { date: "2024-04-11", orders: 224, response: 170, revenue: 8.5, customers: 450 },
  { date: "2024-04-12", orders: 387, response: 290, revenue: 13.8, customers: 710 },
  { date: "2024-04-13", orders: 215, response: 250, revenue: 8.2, customers: 430 },
  { date: "2024-04-14", orders: 75, response: 130, revenue: 3.1, customers: 190 },
  { date: "2024-04-15", orders: 122, response: 180, revenue: 5.1, customers: 300 },
  { date: "2024-04-16", orders: 197, response: 160, revenue: 7.5, customers: 390 },
  { date: "2024-04-17", orders: 473, response: 380, revenue: 17.2, customers: 890 },
  { date: "2024-04-18", orders: 338, response: 400, revenue: 12.9, customers: 670 },
];

// Metric configurations
const metrics = [
  {
    key: "orders",
    label: "Orders",
    value: 2865,
    previousValue: 2420,
    format: (val: number) => val.toLocaleString(),
  },
  {
    key: "response",
    label: "Response Time",
    value: 135,
    previousValue: 118,
    format: (val: number) => `${val}ms`,
    isNegative: true, // Lower response time is better
  },
  {
    key: "revenue",
    label: "Revenue",
    value: 8.67,
    previousValue: 7.54,
    format: (val: number) => `$${val.toFixed(2)}k`,
  },
  {
    key: "customers",
    label: "Active Users",
    value: 1425,
    previousValue: 1240,
    format: (val: number) => val.toLocaleString(),
  },
];

// Use custom or Tailwind standard colors: https://tailwindcss.com/docs/colors
const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--color-teal-500)",
  },
  response: {
    label: "Response Time",
    color: "var(--color-violet-500)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--color-lime-500)",
  },
  customers: {
    label: "Active Users",
    color: "var(--color-sky-500)",
  },
} satisfies ChartConfig;

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const metric = metrics.find((m) => m.key === entry?.dataKey);

    if (metric) {
      return (
        <div className="min-w-[120px] rounded-lg border bg-popover p-3 shadow-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <div className="size-1.5 rounded-full" style={{ backgroundColor: entry?.color }} />
            <span className="text-muted-foreground">{metric.label}:</span>
            <span className="font-semibold text-popover-foreground">{metric.format(entry?.value ?? 0)}</span>
          </div>
        </div>
      );
    }
  }
  return null;
};

export default function LineChartComp() {
  const [selectedMetric, setSelectedMetric] = useState<string>("response");

  return (
    <div className="flex min-h-screen items-center justify-center p-6 lg:p-8">
      <Card className="@container w-full max-w-4xl">
        <CardContent className="p-0">
          <CardHeader className="p-0">
            {/* Metrics Grid */}
            <div className="grid grow @2xl:grid-cols-2 @3xl:grid-cols-4">
              {metrics.map((metric) => {
                const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
                const isPositive = metric.isNegative ? change < 0 : change > 0;

                return (
                  <button
                    className={cn(
                      "flex-1 cursor-pointer @3xl:border-e @2xl:border-b border-b @3xl:border-b-0 p-4 text-start transition-all @3xl:last:border-e-0 last:border-b-0 @2xl:even:border-e",
                      selectedMetric === metric.key && "bg-muted/50"
                    )}
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">{metric.label}</span>
                      <Badge variant={isPositive ? "success" : "destructive"}>
                        {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                        {Math.abs(change).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="font-bold text-2xl">{metric.format(metric.value)}</div>
                    <div className="mt-1 text-muted-foreground text-xs">from {metric.format(metric.previousValue)}</div>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <div className="px-2.5 py-6">
            <ChartContainer
              className="h-96 w-full overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
              config={chartConfig}
            >
              <LineChart
                data={platformData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 5,
                  bottom: 20,
                }}
                style={{ overflow: "visible" }}
              >
                {/* Background pattern for chart area only */}
                <defs>
                  <pattern height="20" id="dotGrid" patternUnits="userSpaceOnUse" width="20" x="0" y="0">
                    <circle cx="10" cy="10" fill="var(--input)" fillOpacity="1" r="1" />
                  </pattern>
                  <filter height="300%" id="lineShadow" width="300%" x="-100%" y="-100%">
                    <feDropShadow
                      dx="4"
                      dy="6"
                      floodColor={`${chartConfig[selectedMetric as keyof typeof chartConfig]?.color}60`}
                      stdDeviation="25"
                    />
                  </filter>
                  <filter height="200%" id="dotShadow" width="200%" x="-50%" y="-50%">
                    <feDropShadow dx="2" dy="2" floodColor="rgba(0,0,0,0.5)" stdDeviation="3" />
                  </filter>
                </defs>

                <XAxis
                  axisLine={false}
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  tickLine={false}
                  tickMargin={10}
                />

                <YAxis
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickCount={6}
                  tickFormatter={(value) => {
                    const metric = metrics.find((m) => m.key === selectedMetric);
                    return metric ? metric.format(value) : value.toString();
                  }}
                  tickLine={false}
                  tickMargin={10}
                />

                <ChartTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#9ca3af" }} />

                {/* Background pattern for chart area only */}
                <rect
                  fill="url(#dotGrid)"
                  height="calc(100% - 10px)"
                  style={{ pointerEvents: "none" }}
                  width="calc(100% - 75px)"
                  x="60px"
                  y="-20px"
                />

                <Line
                  activeDot={{
                    r: 6,
                    fill: chartConfig[selectedMetric as keyof typeof chartConfig]?.color,
                    stroke: "white",
                    strokeWidth: 2,
                    filter: "url(#dotShadow)",
                  }}
                  dataKey={selectedMetric}
                  dot={false}
                  filter="url(#lineShadow)"
                  stroke={chartConfig[selectedMetric as keyof typeof chartConfig]?.color}
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
