import { 
  // IconTrendingDown, 
  IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Mood Today */}
      <Card className="@container/card">
        {/* <CardHeader>
          <CardDescription>Today's Mood</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <span>😊</span>
            <span className="">7 / 10</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Up from yesterday
            </Badge>
          </CardAction>
        </CardHeader> */}
        <CardHeader>
          <CardDescription>Today's Mood</CardDescription>
          <CardTitle className="col-span-full text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <span>😊</span>
            <span>7 / 10</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Up from yesterday
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            "Feeling optimistic and focused"
          </div>
          <div className="text-muted-foreground">Last entry: 9:30am</div>
        </CardFooter>
      </Card>
      {/* Journal Entries */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Journal Entries</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <h6>132</h6>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +3 this week
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            7-day streak <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Keep up the habit!</div>
        </CardFooter>
      </Card>
      {/* Streak */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Streak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <h6>14 days</h6>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Personal best!
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Consistency is key <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Longest streak: 14 days</div>
        </CardFooter>
      </Card>
      {/* Insights */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>AI Insights</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <h6>"You write most on Mondays"</h6>
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
            Top emotion: Joy
          </div>
          <div className="text-muted-foreground">Most active: 8–10am</div>
        </CardFooter>
      </Card>
    </div>
  );
}
