// src/app/actions/audio.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { JournalEntry } from "@/types/entries";
import { summarizeAndTitleEntry } from "@/app/actions/insights";

// === Transcription using Whisper v3 Turbo === //
async function transcribeAudioFromUrl(audioUrl: string): Promise<string> {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: audioUrl }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Transcription failed: ${response.status} — ${errorText}`);
        }

        const result = await response.json();
        if (!result.text) throw new Error("No transcript returned from Whisper.");
        return result.text;
    } catch (error: any) {
        console.error("Whisper transcription error:", error);
        return "Transcription failed. Please try again or edit manually.";
    }
}

// === Upsert audio entry into Supabase === //
async function upsertAudioEntry(
    userId: string,
    entryId: string | null,
    audioUrl: string,
    transcript: string
): Promise<{ success: boolean; data?: JournalEntry; error?: string }> {
    const supabase = await createClient();

    try {
        let result;
        if (entryId) {
            result = await supabase
                .from("entries")
                .update({
                    raw_text: transcript,
                    transcript,
                    audio_url: audioUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", entryId)
                .eq("user_id", userId)
                .select("*")
                .single();
        } else {
            result = await supabase
                .from("entries")
                .insert({
                    user_id: userId,
                    raw_text: transcript,
                    transcript,
                    audio_url: audioUrl,
                    entry_type: "voice",
                    processed: false,
                })
                .select("*")
                .single();
        }

        if (result.error) {
            console.error("Error upserting audio entry:", result.error);
            return { success: false, error: result.error.message };
        }

        return { success: true, data: result.data as JournalEntry };
    } catch (err: any) {
        console.error("Unexpected error in upsertAudioEntry:", err);
        return { success: false, error: "Unexpected database error." };
    }
}

// === Main function to process audio entries === //
export async function processAudioEntry(
    audioFile: File,
    existingEntryId: string | null = null
): Promise<{
    success: boolean;
    entry?: JournalEntry;
    error?: string;
    audioUrl?: string;
    transcript?: string;
}> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated." };

    const fileExt = audioFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    let audioUrl: string | undefined;
    let transcript: string | undefined;
    let createdOrUpdatedEntry: JournalEntry | undefined;

    try {
        // Step 1: Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("audio-entries")
            .upload(filePath, audioFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Audio upload error:", uploadError);
            return { success: false, error: `Upload error: ${uploadError.message}` };
        }

        const { data: publicUrlData } = supabase.storage
            .from("audio-entries")
            .getPublicUrl(filePath);

        audioUrl = publicUrlData.publicUrl;
        if (!audioUrl) {
            return { success: false, error: "Failed to retrieve public audio URL." };
        }

        // Step 2: Transcribe with Whisper Turbo
        transcript = await transcribeAudioFromUrl(audioUrl);

        // Step 3: Upsert entry
        const upsertResult = await upsertAudioEntry(user.id, existingEntryId, audioUrl, transcript);
        if (!upsertResult.success || !upsertResult.data) {
            return { success: false, error: upsertResult.error || "Database insert failed." };
        }

        createdOrUpdatedEntry = upsertResult.data;

        // ✅ Step 4: Immediately generate AI summary and title
        if (transcript && transcript.length > 20) {
            try {
                const insightsResult = await summarizeAndTitleEntry(
                    createdOrUpdatedEntry.id,
                    transcript
                );
                if (!insightsResult.titleSuccess || !insightsResult.summarySuccess) {
                    console.warn("Partial AI summary/title generation:", insightsResult.error);
                }
            } catch (aiError: any) {
                console.error("AI summarization error:", aiError);
            }
        }

        // Step 5: Mark entry as processed
        const { error: processedError } = await supabase
            .from("entries")
            .update({ processed: true, updated_at: new Date().toISOString() })
            .eq("id", createdOrUpdatedEntry.id)
            .eq("user_id", user.id);

        if (processedError) {
            console.error("Failed to mark entry as processed:", processedError);
        }

        return {
            success: true,
            entry: createdOrUpdatedEntry,
            audioUrl,
            transcript,
        };
    } catch (err: any) {
        console.error("Unexpected error in processAudioEntry:", err);
        return { success: false, error: "Unexpected error during audio processing." };
    }
}
