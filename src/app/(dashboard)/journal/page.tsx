import JournalEditor from "@/components/JournalEditor";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getRecentEntries } from "../../actions/journal-actions";

export default async function JournalPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["entries"],
    queryFn: () => getRecentEntries(),
  });

  return (

          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="container mx-auto flex flex-col gap-8">
                <div className="flex flex-col gap-2 px-4 lg:px-6 py-4 lg:py-12 lg:pb-6 pt-24 lg:pt-16">
                  <h1 className="text-3xl font-normal text-[var(--color-foreground)] mb-4">
                    Start Writing...
                  </h1>
                  <span className="text-sm text-[var(--color-foreground-muted)] mb-4">
                    Reflect on your week, jot down your thoughts, or just write
                    freely. Your journal is a safe space for your thoughts.
                  </span>
                  <HydrationBoundary state={dehydrate(queryClient)}>
                    <JournalEditor />
                  </HydrationBoundary>
                </div>
              </div>
            </div>
          </div>
  );
}
