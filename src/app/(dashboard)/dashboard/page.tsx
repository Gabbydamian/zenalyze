import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table"; // This will be updated
import { SectionCards } from "@/components/section-cards";
// import data from "./data.json"; // REMOVE THIS LINE
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconFileDescription,
  IconMoodCheck,
  IconSparkles,
} from "@tabler/icons-react";

// Import your updated getDetailedEntries and DetailedEntryForFrontend
import {
  getDetailedEntries,
} from "@/app/actions/journal-actions";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";

// Import your columns definition
import { columns } from "@/components/data-table"; // Import columns from data-table.tsx
import { DetailedEntryForFrontend } from "@/types/entries";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["entries"],
    queryFn: () => getDetailedEntries(), // Use your new action
  });

  // Get the data from the prefetched query
  const entries = queryClient.getQueryData<DetailedEntryForFrontend[]>([
    "entries",
  ]);

  // Provide a default empty array if entries is undefined/null initially
  const initialTableData = entries || [];

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="container mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-4 lg:px-6 py-4 lg:py-12 lg:pb-6 pt-24 lg:pt-16">
            <h1 className="text-4xl">This week at a glance</h1>
            <p className="text-md">
              You&apos;ve been feeling calm but tired lately. Want to reflect?
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-[var(--color-chart-2)] w-fit mt-4 px-6 py-4 ">
                  Start Reflecting
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <p className="text-sm text-muted-foreground">
                  Reflect on your week with a journal entry, mood tracker, or
                  audio note. Choose one of the options below to get started.
                </p>
                <div id="reflect-options" className="flex flex-col mt-4 gap-2">
                  <Button variant="outline" className="mr-2">
                    <Link
                      href="/journal"
                      className="flex items-center w-full justify-center"
                    >
                      <IconFileDescription className="mr-1" />
                      Journal
                    </Link>
                  </Button>
                  <Button variant="outline" className="mr-2">
                    <Link
                      href="/mood"
                      className="flex items-center w-full justify-center"
                    >
                      <IconMoodCheck className="mr-1" />
                      Mood Check-In
                    </Link>
                  </Button>
                  <Button variant="outline" className="mr-2">
                    <Link
                      href="/audio"
                      className="flex items-center w-full justify-center"
                    >
                      <IconSparkles className="mr-1" />
                      Audio
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <HydrationBoundary state={dehydrate(queryClient)}>
            {/* Pass the fetched data to DataTable */}
            <DataTable data={initialTableData} columns={columns} />
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
}
