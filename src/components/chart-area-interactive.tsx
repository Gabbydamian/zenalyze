"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

// Mock data for mood score (1-10) and journal entries per day
const chartData = [
  { date: "2024-06-01", mood: 6, entries: 1 },
  { date: "2024-06-02", mood: 7, entries: 2 },
  { date: "2024-06-03", mood: 8, entries: 1 },
  { date: "2024-06-04", mood: 5, entries: 0 },
  { date: "2024-06-05", mood: 7, entries: 1 },
  { date: "2024-06-06", mood: 9, entries: 2 },
  { date: "2024-06-07", mood: 8, entries: 1 },
  { date: "2024-06-08", mood: 6, entries: 1 },
  { date: "2024-06-09", mood: 7, entries: 2 },
  { date: "2024-06-10", mood: 8, entries: 1 },
  { date: "2024-06-11", mood: 7, entries: 1 },
  { date: "2024-06-12", mood: 6, entries: 0 },
  { date: "2024-06-13", mood: 8, entries: 2 },
  { date: "2024-06-14", mood: 9, entries: 1 },
  { date: "2024-06-15", mood: 7, entries: 1 },
  { date: "2024-06-16", mood: 8, entries: 2 },
  { date: "2024-06-17", mood: 7, entries: 1 },
  { date: "2024-06-18", mood: 6, entries: 1 },
  { date: "2024-06-19", mood: 7, entries: 2 },
  { date: "2024-06-20", mood: 8, entries: 1 },
  { date: "2024-06-21", mood: 7, entries: 1 },
  { date: "2024-06-22", mood: 8, entries: 2 },
  { date: "2024-06-23", mood: 9, entries: 1 },
  { date: "2024-06-24", mood: 8, entries: 1 },
  { date: "2024-06-25", mood: 7, entries: 2 },
  { date: "2024-06-26", mood: 8, entries: 1 },
  { date: "2024-06-27", mood: 7, entries: 1 },
  { date: "2024-06-28", mood: 6, entries: 0 },
  { date: "2024-06-29", mood: 8, entries: 2 },
  { date: "2024-06-30", mood: 9, entries: 1 },
  { date: "2024-07-01", mood: 7, entries: 1 },
  { date: "2024-07-02", mood: 8, entries: 2 },
  { date: "2024-07-03", mood: 6, entries: 1 },
  { date: "2024-07-04", mood: 7, entries: 2 },
  { date: "2024-07-05", mood: 8, entries: 1 },
  { date: "2024-07-06", mood: 9, entries: 1 },
  { date: "2024-07-07", mood: 7, entries: 2 },
  { date: "2024-07-08", mood: 8, entries: 1 },
  { date: "2024-07-09", mood: 7, entries: 1 },
  { date: "2024-07-10", mood: 6, entries: 0 },
  { date: "2024-07-11", mood: 8, entries: 2 },
  { date: "2024-07-12", mood: 9, entries: 1 },
  { date: "2024-07-13", mood: 7, entries: 1 },
  { date: "2024-07-14", mood: 8, entries: 2 },
  { date: "2024-07-15", mood: 7, entries: 1 },
  { date: "2024-07-16", mood: 6, entries: 1 },
  { date: "2024-07-17", mood: 7, entries: 2 },
  { date: "2024-07-18", mood: 8, entries: 1 },
  { date: "2024-07-19", mood: 7, entries: 1 },
  { date: "2024-07-20", mood: 6, entries: 0 },
];

const chartConfig = {
  mood: {
    label: "Mood Score",
    color: "var(--color-chart-2)",
  },
  entries: {
    label: "Journal Entries",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 30;
    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Mood & Journal Activity</CardTitle>
        <CardDescription>
          Mood score (1–10) and journal entries per day for the selected range
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMood" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mood"
              type="monotone"
              fill="url(#fillMood)"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Mood Score"
            />
            <Area
              dataKey="entries"
              type="monotone"
              fill="url(#fillEntries)"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Journal Entries"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
