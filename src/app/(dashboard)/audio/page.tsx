import AudioJournalRecorder from "@/components/AudioJournalRecorder";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getRecentEntries } from "../../actions/journal-actions";

export default async function AudioPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["entries"],
    queryFn: () => getRecentEntries(),
  });

  return (

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="container mx-auto flex flex-col gap-8">
                <div className="flex flex-col gap-2 px-4 lg:px-6 py-4 lg:py-12 lg:pb-6 pt-24 lg:pt-16">
                  <h1 className="text-3xl font-normal text-[var(--color-foreground)] mb-4">
                    Audio Journal
                  </h1>
                  <span className="text-sm text-[var(--color-foreground-muted)] mb-4">
                    Record your thoughts or upload an audio file, and we'll
                    transcribe it for you.
                  </span>
                  <HydrationBoundary state={dehydrate(queryClient)}>
                    <AudioJournalRecorder />
                  </HydrationBoundary>
                </div>
              </div>
            </div>
          </div>
  );
}
