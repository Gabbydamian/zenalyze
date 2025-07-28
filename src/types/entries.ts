import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/supabase-schema";

export type JournalEntry = Tables<"entries">;
export type JournalEntryInsert = TablesInsert<"entries">;
export type JournalEntryUpdate = TablesUpdate<"entries">;

