import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/supabase-schema";

export type JournalEntry = Tables<"entries">;
export type JournalEntryInsert = TablesInsert<"entries">;
export type JournalEntryUpdate = TablesUpdate<"entries">;

export type DetailedEntry = Tables<"entries"> & Partial<Tables<"insights">>;

export type EntryWithOptionalInsights = Tables<"entries"> & {
  insights: Pick<
    Tables<"insights">,
    "sentiment_score" | "emotions" | "summary"
  > | null;
};


export type DetailedEntryForFrontend = {
  id: string;
  date: string;
  mood: string;
  score: number;
  title: string;
  excerpt: string;
  emotion_tags: string[];
  summary: string;
  category: string;
};
