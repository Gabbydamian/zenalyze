import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import data from "./data.json";
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

import { getJournalEntries } from "@/app/actions/journal-actions";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["entries"],
    queryFn: () => getJournalEntries(),
  });
  return (

          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="container mx-auto flex flex-col gap-8">
                <div className="flex flex-col gap-2 px-4 lg:px-6 py-4 lg:py-12 lg:pb-6 pt-24 lg:pt-16">
                  <h1 className="text-4xl">This week at a glance</h1>
                  <p className="text-md">
                    You&apos;ve been feeling calm but tired lately. Want to
                    reflect?
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="bg-[var(--color-chart-2)] w-fit mt-4 px-6 py-4 ">
                        Start Reflecting
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm text-muted-foreground">
                        Reflect on your week with a journal entry, mood tracker,
                        or audio note. Choose one of the options below to get
                        started.
                      </p>
                      <div
                        id="reflect-options"
                        className="flex flex-col mt-4 gap-2"
                      >
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
                  <DataTable data={data} />
                </HydrationBoundary>
              </div>
            </div>
          </div>
  
  );
}
