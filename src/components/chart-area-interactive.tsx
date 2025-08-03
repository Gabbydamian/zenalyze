"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query"; // Import useQuery

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

// Import your getDetailedEntries and DetailedEntryForFrontend
import {
  getDetailedEntries,
} from "@/app/actions/journal-actions";
import { DetailedEntryForFrontend } from "@/types/entries";

export const description = "An interactive area chart";

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

// Define a type for your chart data points
type ChartDataItem = {
  date: string;
  mood: number;
  entries: number;
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  // Fetch data using useQuery
  const {
    data: journalEntries,
    isLoading,
    isError,
  } = useQuery<DetailedEntryForFrontend[]>({
    queryKey: ["entries"], // Use the same queryKey as in page.tsx
    queryFn: getDetailedEntries,
  });

  // Process journalEntries into chartData format
  const processedChartData = React.useMemo(() => {
    if (!journalEntries) return [];

    const dailyData: {
      [key: string]: {
        moodSum: number;
        entryCount: number;
        dataPoints: number;
      };
    } = {};

    journalEntries.forEach((entry) => {
      // Use the 'date' property from DetailedEntryForFrontend (which is an ISO string)
      const dateKey = new Date(entry.date).toISOString().split("T")[0]; // Format to YYYY-MM-DD

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { moodSum: 0, entryCount: 0, dataPoints: 0 };
      }
      dailyData[dateKey].moodSum += entry.score;
      dailyData[dateKey].entryCount += 1; // Count entries per day
      dailyData[dateKey].dataPoints += 1; // Count entries for averaging mood
    });

    const chartDataArray: ChartDataItem[] = Object.keys(dailyData)
      .sort() // Sort by date
      .map((date) => ({
        date: date,
        mood: Math.round(dailyData[date].moodSum / dailyData[date].dataPoints), // Average mood
        entries: dailyData[date].entryCount,
      }));

    return chartDataArray;
  }, [journalEntries]);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (!processedChartData.length) return [];

    // Find the latest date in the actual data, not a fixed mock date
    const latestDate = new Date(
      processedChartData[processedChartData.length - 1].date
    );
    let daysToSubtract = 30;

    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0); // Set to start of the day for accurate comparison

    return processedChartData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [processedChartData, timeRange]);

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Mood & Journal Activity</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center">
            <p>Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !journalEntries || journalEntries.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Mood & Journal Activity</CardTitle>
          <CardDescription>
            No data available to display the chart.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center">
            <p>Start journaling to see your trends!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {" "}
            {/* Use filteredData here */}
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
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-3)"
                  stopOpacity={0.8}
                />
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
