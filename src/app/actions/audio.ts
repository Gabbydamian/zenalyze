// src/app/actions/audio.ts

"use server"; // Marks this file as a Server Action

import { createClient } from "@/lib/supabase/server";
import { JournalEntry } from "@/types/entries";
import { summarizeAndTitleEntry } from "@/app/actions/insights";
import pRetry from 'p-retry'; // Import p-retry
import Groq from "groq-sdk"; // Import the Groq SDK

// Initialize Groq SDK with your API key
// Ensure process.env.GROQ_API_KEY is set in your .env.local or environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// === Upsert audio entry into Supabase === //
/**
 * Inserts or updates a journal entry in Supabase with audio URL and transcript.
 *
 * @param userId The ID of the user.
 * @param entryId Optional ID of an existing entry to update.
 * @param audioUrl The public URL of the uploaded audio file.
 * @param transcript The transcribed text of the audio.
 * @returns An object indicating success/failure and the journal entry data.
 */
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
      // Update existing entry
      result = await supabase
        .from("entries")
        .update({
          raw_text: transcript,
          transcript,
          audio_url: audioUrl,
          updated_at: new Date().toISOString(), // Update timestamp
        })
        .eq("id", entryId)
        .eq("user_id", userId) // Ensure user owns the entry
        .select("*")
        .single();
    } else {
      // Insert new entry
      result = await supabase
        .from("entries")
        .insert({
          user_id: userId,
          raw_text: transcript,
          transcript,
          audio_url: audioUrl,
          entry_type: "voice", // Mark as voice entry
          processed: false, // Initial state, will be marked true later
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
/**
 * Main Server Action to handle the entire audio journal entry process:
 * 1. Authenticates the user.
 * 2. Uploads the audio file to Supabase Storage.
 * 3. Generates a signed URL to securely fetch the uploaded audio.
 * 4. Fetches the uploaded audio from its signed URL.
 * 5. Transcribes the fetched audio using Groq Whisper.
 * 6. Upserts the audio entry (with transcript) into the Supabase database.
 * 7. Triggers AI summarization and titling for the entry.
 * 8. Marks the entry as processed.
 *
 * @param audioFile The audio file (File object) received from the client.
 * @param existingEntryId Optional ID of an existing entry to update.
 * @returns An object indicating success/failure and relevant data.
 */
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

  if (!user) {
    console.error("processAudioEntry: User not authenticated.");
    return { success: false, error: "User not authenticated." };
  }

  const fileExt = audioFile.name.split(".").pop();
  const safeFileExt = fileExt ? fileExt.toLowerCase() : "webm";
  const filePath = `${user.id}/${Date.now()}.${safeFileExt}`;

  let audioUrl: string | undefined;
  let transcript: string | undefined;
  let createdOrUpdatedEntry: JournalEntry | undefined;

  try {
    // Step 1: Upload to Supabase Storage with retry logic
    console.log(
      "processAudioEntry: Starting Supabase audio upload (with retries)..."
    );

    // Define the upload function to be retried
    const uploadAttempt = async (attempt: number) => {
      if (attempt > 1) {
        console.warn(
          `Attempt ${attempt}: Retrying Supabase audio upload for ${filePath}...`
        );
      }
      const { error: uploadError } = await supabase.storage
        .from("audio-entries")
        .upload(filePath, audioFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Log specific error details from Supabase Storage
        console.error(
          `Upload attempt ${attempt} failed for ${filePath}:`,
          uploadError.message
        );
        // Throw the error to trigger a retry
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
      }
      return { success: true };
    };

    const result = await pRetry(uploadAttempt, {
      retries: 5, // Try 5 times (initial attempt + 4 retries)
      minTimeout: 1000, // 1 second
      maxTimeout: 10000, // 10 seconds
      onFailedAttempt: (error) => {
        console.warn(
          `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
        );
        console.error(error.message); // Log the specific error for each failed attempt
      },
    });

    if (!result.success) {
      // This path should ideally not be reached if pRetry re-throws on final failure
      console.error(
        "processAudioEntry: Audio upload failed after all retries."
      );
      return {
        success: false,
        error: "Audio upload failed after multiple attempts.",
      };
    }
    console.log(
      "processAudioEntry: Audio uploaded to Supabase storage successfully after retries."
    );

    // Rest of your function remains largely the same
    // Get the *public* URL
    const { data: publicUrlData } = supabase.storage
      .from("audio-entries")
      .getPublicUrl(filePath);

    audioUrl = publicUrlData.publicUrl;
    if (!audioUrl) {
      console.error(
        "processAudioEntry: Failed to retrieve public audio URL for database storage."
      );
      return { success: false, error: "Failed to retrieve public audio URL." };
    }
    console.log(
      "processAudioEntry: Public audio URL obtained for database:",
      audioUrl
    );

    // Generate a signed URL for server-side fetching
    console.log(
      "processAudioEntry: Generating signed URL for server-side fetch..."
    );
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("audio-entries")
        .createSignedUrl(filePath, 100);

    if (signedUrlError) {
      console.error(
        "processAudioEntry: Error generating signed URL:",
        signedUrlError
      );
      return {
        success: false,
        error: `Failed to generate signed URL: ${signedUrlError.message}`,
      };
    }
    const signedAudioUrl = signedUrlData.signedUrl;
    console.log("processAudioEntry: Signed URL generated.");

    // Fetch audio from SIGNED URL and Transcribe with Groq Whisper
    console.log(
      "processAudioEntry: Fetching audio from SIGNED URL for transcription..."
    );
    const audioResponse = await fetch(signedAudioUrl);
    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error(
        `processAudioEntry: Failed to fetch audio from SIGNED URL: ${audioResponse.status} - ${errorText}`
      );
      throw new Error(
        `Failed to fetch audio from SIGNED URL: ${audioResponse.statusText}`
      );
    }
    console.log(
      "processAudioEntry: Audio fetched successfully. Converting to Blob..."
    );
    const audioBlobFromUrl = await audioResponse.blob();
    console.log(
      "processAudioEntry: Audio Blob created. Size:",
      audioBlobFromUrl.size,
      "Type:",
      audioBlobFromUrl.type
    );

    const fileToTranscribe = new File(
      [audioBlobFromUrl],
      audioFile.name || `transcribe-${Date.now()}.${safeFileExt}`,
      { type: audioBlobFromUrl.type, lastModified: Date.now() }
    );
    console.log(
      "processAudioEntry: File object created for Groq transcription."
    );

    console.log("processAudioEntry: Starting Groq transcription...");
    const transcription = await groq.audio.transcriptions.create({
      file: fileToTranscribe,
      model: "whisper-large-v3",
      language: "en",
      response_format: "verbose_json",
    });

    if (!transcription.text) {
      console.error(
        "processAudioEntry: No transcript returned from Groq Whisper."
      );
      throw new Error("No transcript returned from Groq Whisper.");
    }
    transcript = transcription.text;
    console.log(
      "processAudioEntry: Groq transcription completed. Transcript length:",
      transcript.length
    );

    // Upsert entry into Supabase database
    console.log("processAudioEntry: Starting Supabase entry upsert...");
    const upsertResult = await upsertAudioEntry(
      user.id,
      existingEntryId,
      audioUrl,
      transcript
    );
    if (!upsertResult.success || !upsertResult.data) {
      console.error(
        "processAudioEntry: Supabase upsert failed:",
        upsertResult.error
      );
      return {
        success: false,
        error: upsertResult.error || "Database upsert failed.",
      };
    }
    createdOrUpdatedEntry = upsertResult.data;
    console.log(
      "processAudioEntry: Supabase entry upsert completed. Entry ID:",
      createdOrUpdatedEntry.id
    );

    // Immediately generate AI summary and title
    if (transcript && transcript.length > 20) {
      console.log(
        "processAudioEntry: Starting AI summarization and titling..."
      );
      try {
        const insightsResult = await summarizeAndTitleEntry(
          createdOrUpdatedEntry.id,
          transcript
        );
        if (!insightsResult.titleSuccess || !insightsResult.summarySuccess) {
          console.warn(
            "processAudioEntry: Partial AI summary/title generation:",
            insightsResult.error
          );
        }
        console.log(
          "processAudioEntry: AI summarization and titling completed."
        );
      } catch (aiError: any) {
        console.error("processAudioEntry: AI summarization error:", aiError);
      }
    } else {
      console.log(
        "processAudioEntry: Transcript too short for AI summarization."
      );
    }

    // Mark entry as processed in the database
    console.log("processAudioEntry: Marking entry as processed...");
    const { error: processedError } = await supabase
      .from("entries")
      .update({ processed: true, updated_at: new Date().toISOString() })
      .eq("id", createdOrUpdatedEntry.id)
      .eq("user_id", user.id);

    if (processedError) {
      console.error(
        "processAudioEntry: Failed to mark entry as processed:",
        processedError
      );
    }
    console.log("processAudioEntry: Entry marked as processed.");

    console.log("processAudioEntry: Audio processing completed successfully.");
    return {
      success: true,
      entry: createdOrUpdatedEntry,
      audioUrl,
      transcript,
    };
  } catch (err: any) {
    console.error(
      "processAudioEntry: Caught unexpected error during audio processing:",
      err
    );
    return {
      success: false,
      error: `Error during audio processing: ${
        err.message || "An unknown error occurred."
      }`,
    };
  }
}
