import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/supabase-schema";

export type Pattern = Tables<"patterns">;
export type PatternInsert = TablesInsert<"patterns">;
export type PatternUpdate = TablesUpdate<"patterns">;