"use client"
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Import your data fetching function and type
import { getDetailedEntries } from "@/app/actions/journal-actions";
import { DetailedEntryForFrontend } from "@/types/entries";

// A dummy function to get mood emoji based on score
const getMoodEmoji = (score: number) => {
  if (score >= 9) return "🤩";
  if (score >= 7) return "😊";
  if (score >= 5) return "😐";
  if (score >= 3) return "�";
  return "😩";
};

// A helper function to get the day of the week
const getDayOfWeek = (date: Date): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

export function SectionCards() {
  const { data: journalEntries, isLoading, isError } = useQuery<DetailedEntryForFrontend[]>({
    queryKey: ["entries"],
    queryFn: getDetailedEntries,
  });

  // Memoized calculations for all card data
  const {
    todayData,
    totalEntries,
    entriesThisWeek,
    currentStreak,
    longestStreak,
    trendToday,
    aiInsights,
  } = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // --- Card 1: Today's Mood ---
    // Filter for today's entries and get the most recent one
    const todayEntries = journalEntries
      ?.filter((entry) => new Date(entry.date).toDateString() === today.toDateString())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const mostRecentToday = todayEntries?.[0];

    // Find the last entry from yesterday for comparison
    const yesterdayEntries = journalEntries
      ?.filter((entry) => new Date(entry.date).toDateString() === yesterday.toDateString())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const mostRecentYesterday = yesterdayEntries?.[0];

    // Determine mood trend
    let trendToday: "up" | "down" | "neutral" = "neutral";
    if (mostRecentToday && mostRecentYesterday) {
      if (mostRecentToday.score > mostRecentYesterday.score) {
        trendToday = "up";
      } else if (mostRecentToday.score < mostRecentYesterday.score) {
        trendToday = "down";
      }
    }

    // --- Card 2: Journal Entries & This Week Count ---
    const totalEntries = journalEntries?.length || 0;
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const entriesThisWeek = journalEntries?.filter(entry => new Date(entry.date) >= oneWeekAgo).length || 0;

    // --- Card 3: Current & Longest Streak ---
    let currentStreak = 0;
    let longestStreak = 0;
    if (journalEntries && journalEntries.length > 0) {
      // Get unique dates and sort them
      const uniqueDates = Array.from(new Set(journalEntries.map(entry => new Date(entry.date).toDateString())))
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a.getTime() - b.getTime());

      if (uniqueDates.length > 0) {
        let streak = 0;
        let maxStreak = 0;
        let lastDate = new Date(today); // Start with today's date

        // Check if there was an entry today
        if (uniqueDates[uniqueDates.length - 1].toDateString() === today.toDateString()) {
          streak = 1;
        }

        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const currentDate = uniqueDates[i];
          const nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + 1);

          if (nextDate.toDateString() === uniqueDates[i+1].toDateString()) {
            streak++;
          } else {
            if (streak > maxStreak) {
              maxStreak = streak;
            }
            streak = 1;
          }
        }
        if (streak > maxStreak) {
            maxStreak = streak;
        }
        longestStreak = maxStreak;

        // Recalculate current streak starting from today
        currentStreak = 0;
        let checkDate = new Date(today);
        if (uniqueDates.some(d => d.toDateString() === checkDate.toDateString())) {
            currentStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            while (uniqueDates.some(d => d.toDateString() === checkDate.toDateString())) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }
      }
    }

    // --- Card 4: AI Insights ---
    const aiInsights = {
      mostActiveDay: "N/A",
      topEmotion: "N/A",
      mostActiveTime: "N/A",
    };

    if (journalEntries && journalEntries.length > 0) {
      const dayCounts: { [key: string]: number } = {};
      const emotionCounts: { [key: string]: number } = {};
      const timeBuckets: { [key: string]: number } = {
        "Morning (6am-12pm)": 0,
        "Afternoon (12pm-6pm)": 0,
        "Evening (6pm-12am)": 0,
        "Night (12am-6am)": 0,
      };

      journalEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const day = getDayOfWeek(entryDate);
        dayCounts[day] = (dayCounts[day] || 0) + 1;

        entry.emotion_tags?.forEach(tag => {
          emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
        });

        const hour = entryDate.getHours();
        if (hour >= 6 && hour < 12) {
          timeBuckets["Morning (6am-12pm)"]++;
        } else if (hour >= 12 && hour < 18) {
          timeBuckets["Afternoon (12pm-6pm)"]++;
        } else if (hour >= 18) {
          timeBuckets["Evening (6pm-12am)"]++;
        } else {
          timeBuckets["Night (12am-6am)"]++;
        }
      });

      aiInsights.mostActiveDay = Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a])[0] || "N/A";
      aiInsights.topEmotion = Object.keys(emotionCounts).sort((a, b) => emotionCounts[b] - emotionCounts[a])[0] || "N/A";
      aiInsights.mostActiveTime = Object.keys(timeBuckets).sort((a, b) => timeBuckets[b] - timeBuckets[a])[0] || "N/A";
    }

    return {
      todayData: mostRecentToday,
      totalEntries,
      entriesThisWeek,
      currentStreak,
      longestStreak,
      trendToday,
      aiInsights,
    };
  }, [journalEntries]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !journalEntries || journalEntries.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>No data available</CardDescription>
            <CardTitle>Start your first entry!</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Helper to format date as "9:30am"
  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Mood Today */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today's Mood</CardDescription>
          <CardTitle className="col-span-full text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <span>{todayData ? getMoodEmoji(todayData.score) : "😐"}</span>
            <span>{todayData ? `${todayData.score} / 10` : "N/A"}</span>
          </CardTitle>
          <CardAction>
            {todayData && trendToday !== "neutral" && (
              <Badge variant="outline">
                {trendToday === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
                {trendToday === "up" ? "Up from yesterday" : "Down from yesterday"}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {todayData?.summary.slice(0, 70) + "..." || "No entries today."}
          </div>
          <div className="text-muted-foreground">
            {todayData ? `Last entry: ${formatTime(new Date(todayData.date))}` : ""}
          </div>
        </CardFooter>
      </Card>
      {/* Journal Entries */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Journal Entries</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <h6>{totalEntries}</h6>
          </CardTitle>
          <CardAction>
            {entriesThisWeek > 0 && (
              <Badge variant="outline">
                <IconTrendingUp />+{entriesThisWeek} this week
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {currentStreak > 0 ? `${currentStreak}-day streak` : "Start a streak!"}
            {currentStreak > 0 && <IconTrendingUp className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {`Keep up the habit!`}
          </div>
        </CardFooter>
      </Card>
      {/* Streak */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Streak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <h6>{currentStreak} days</h6>
          </CardTitle>
          <CardAction>
            {currentStreak === longestStreak && longestStreak > 0 && (
              <Badge variant="outline">
                <IconTrendingUp />
                Personal best!
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Consistency is key
            {currentStreak > 0 && <IconTrendingUp className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Longest streak: {longestStreak} days
          </div>
        </CardFooter>
      </Card>
      {/* Insights */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>AI Insights</CardDescription>
          <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
            <h6>
              {aiInsights.mostActiveDay !== "N/A"
                ? `You write most on ${aiInsights.mostActiveDay}`
                : "No insights yet"}
            </h6>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              New insight
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Top emotion: {aiInsights.topEmotion}
          </div>
          <div className="text-muted-foreground">
            Most active: {aiInsights.mostActiveTime}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}