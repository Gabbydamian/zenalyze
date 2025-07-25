"use server"

import { createClient } from "@/lib/server"
import { JournalEntry, JournalEntryInsert, JournalEntryUpdate } from "@/types/entries";
import { revalidatePath } from "next/cache";

type ActionResult<T> = {
    data?: T;
    error?: string;
    success: boolean;
};

async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Authentication required");
    }

    return user;
}

export async function createJournalEntry(
    entry: Omit<JournalEntryInsert, 'user_id' | 'id' | 'created_at'>
): Promise<ActionResult<JournalEntry>> {
    try {
        const user = await getCurrentUser(); // Get the authenticated user

        if (!user) {
            return {
                success: false,
                error: "User not authenticated. Please log in."
            };
        }

        const supabase = await createClient(); // Get the Supabase client

        // Input validation based on entry_type
        if (entry.entry_type === 'text' && (!entry.raw_text || !entry.raw_text.trim())) {
            return {
                success: false,
                error: "Text content is required for text entries"
            };
        }

        if (entry.entry_type === 'voice' && !entry.audio_url) {
            return {
                success: false,
                error: "Audio URL is required for voice entries"
            };
        }

        const entryToInsert = {
            ...entry,
            user_id: user.id, // Explicitly set the user_id from the authenticated user
        };

        const { data, error } = await supabase
            .from("entries")
            .insert(entryToInsert) // Use the modified object with user_id
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error.message);
            return {
                success: false,
                error: `Failed to create entry: ${error.message}`
            };
        }

        revalidatePath('/journal');
        revalidatePath('/dashboard'); // Assuming you also display entries on a dashboard

        return {
            success: true,
            data
        };

    } catch (error) {
        console.error("An unexpected error occurred in createJournalEntry:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

export async function getJournalEntries(
    limit: number = 10,
    offset: number = 0,
    entryType?: 'text' | 'voice' | 'checkin'
): Promise<ActionResult<JournalEntry[]>> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        let query = supabase
            .from("entries")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (entryType) {
            query = query.eq("entry_type", entryType);
        }

        const { data, error } = await query;

        if (error) {
            return {
                success: false,
                error: `Failed to fetch entries: ${error.message}`
            };
        }

        return {
            success: true,
            data: data || []
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// Get single journal entry
export async function getJournalEntry(id: string): Promise<ActionResult<JournalEntry>> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("entries")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error) {
            return {
                success: false,
                error: error.code === 'PGRST116' ? "Entry not found" : `Failed to fetch entry: ${error.message}`
            };
        }

        return {
            success: true,
            data
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// Update journal entry
export async function updateJournalEntry(
    id: string,
    updates: JournalEntryUpdate
): Promise<ActionResult<JournalEntry>> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        // First check if the entry exists and belongs to the user
        const { data: existingEntry, error: fetchError } = await supabase
            .from("entries")
            .select("id")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (fetchError) {
            return {
                success: false,
                error: fetchError.code === 'PGRST116' ? "Entry not found" : `Failed to verify entry: ${fetchError.message}`
            };
        }

        const { data, error } = await supabase
            .from("entries")
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `Failed to update entry: ${error.message}`
            };
        }

        // Revalidate relevant paths
        revalidatePath('/journal');
        revalidatePath(`/journal/${id}`);

        return {
            success: true,
            data
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// Delete journal entry
export async function deleteJournalEntry(id: string): Promise<ActionResult<void>> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        const { error } = await supabase
            .from("entries")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            return {
                success: false,
                error: `Failed to delete entry: ${error.message}`
            };
        }

        // Revalidate relevant paths
        revalidatePath('/journal');
        revalidatePath('/dashboard');

        return {
            success: true
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// Search journal entries
export async function searchJournalEntries(
    query: string,
    limit: number = 10
): Promise<ActionResult<JournalEntry[]>> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        if (!query.trim()) {
            return {
                success: true,
                data: []
            };
        }

        const { data, error } = await supabase
            .from("entries")
            .select("*")
            .eq("user_id", user.id)
            .or(`raw_text.ilike.%${query}%,transcript.ilike.%${query}%`)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            return {
                success: false,
                error: `Search failed: ${error.message}`
            };
        }

        return {
            success: true,
            data: data || []
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// Get entries by mood score range
export async function getEntriesByMood(
    minScore: number,
    maxScore: number,
    limit: number = 10
): Promise<ActionResult<JournalEntry[]>> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("entries")
            .select("*")
            .eq("user_id", user.id)
            .gte("mood_score", minScore)
            .lte("mood_score", maxScore)
            .not("mood_score", "is", null)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            return {
                success: false,
                error: `Failed to fetch entries by mood: ${error.message}`
            };
        }

        return {
            success: true,
            data: data || []
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

export async function getRecentEntries(limit: number = 5): Promise<ActionResult<JournalEntry[]>> {
    return getJournalEntries(limit, 0);
}