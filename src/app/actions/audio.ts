// src/app/actions/audio.ts

"use server"; // Marks this file as a Server Action

import { createClient } from "@/lib/supabase/server";
import { JournalEntry } from "@/types/entries";
import { summarizeAndTitleEntry } from "@/app/actions/insights";
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
  audioFile: File, // This is the File object received from the client-side form submission
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

  // Determine file extension safely
  const fileExt = audioFile.name.split(".").pop();
  const safeFileExt = fileExt ? fileExt.toLowerCase() : "webm"; // Default to 'webm' as MediaRecorder often outputs this
  const filePath = `${user.id}/${Date.now()}.${safeFileExt}`; // Unique path for storage

  let audioUrl: string | undefined; // This will now store the *public* URL, not the signed one
  let transcript: string | undefined;
  let createdOrUpdatedEntry: JournalEntry | undefined;

  try {
    // Step 1: Upload to Supabase Storage
    console.log("processAudioEntry: Starting Supabase audio upload...");
    const { error: uploadError } = await supabase.storage
      .from("audio-entries")
      .upload(filePath, audioFile, {
        // Upload the original audioFile
        cacheControl: "3600", // Cache for 1 hour
        upsert: false, // Do not overwrite if file exists (though timestamp makes it unique)
      });

    if (uploadError) {
      console.error("processAudioEntry: Audio upload error:", uploadError);
      return { success: false, error: `Upload error: ${uploadError.message}` };
    }
    console.log("processAudioEntry: Audio uploaded to Supabase storage.");

    // Get the *public* URL for storage in the database (for client-side playback later)
    // This URL won't work for direct server-side fetch if bucket is private,
    // but it's what you'll store for authenticated client access.
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

    // --- IMPORTANT CHANGE: Generate a signed URL for server-side fetching ---
    console.log(
      "processAudioEntry: Generating signed URL for server-side fetch..."
    );
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("audio-entries")
        .createSignedUrl(filePath, 100); // URL valid for 100 seconds (adjust as needed)

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

    // Step 2: Fetch audio from SIGNED URL and Transcribe with Groq Whisper
    console.log(
      "processAudioEntry: Fetching audio from SIGNED URL for transcription..."
    );
    const audioResponse = await fetch(signedAudioUrl); // Use the signed URL here
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
    // Get the audio content as a Blob
    const audioBlobFromUrl = await audioResponse.blob();
    console.log(
      "processAudioEntry: Audio Blob created. Size:",
      audioBlobFromUrl.size,
      "Type:",
      audioBlobFromUrl.type
    );

    // Convert the Blob to a File object, as Groq SDK's Uploadable type
    // expects properties like 'name' and 'lastModified' which are present on File.
    // Use the original file's name or a generated one, and its type.
    const fileToTranscribe = new File(
      [audioBlobFromUrl],
      audioFile.name || `transcribe-${Date.now()}.${safeFileExt}`, // Use original name or generated
      { type: audioBlobFromUrl.type, lastModified: Date.now() } // Add type and lastModified
    );
    console.log(
      "processAudioEntry: File object created for Groq transcription."
    );

    console.log("processAudioEntry: Starting Groq transcription...");
    const transcription = await groq.audio.transcriptions.create({
      file: fileToTranscribe, // Pass the created File object to Groq
      model: "whisper-large-v3", // Specify the Groq Whisper model
      language: "en", // Set the language
      response_format: "verbose_json", // Request verbose JSON to get the 'text' property
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

    // Step 3: Upsert entry into Supabase database
    console.log("processAudioEntry: Starting Supabase entry upsert...");
    const upsertResult = await upsertAudioEntry(
      user.id,
      existingEntryId,
      audioUrl,
      transcript
    ); // Use the *public* audioUrl for DB storage
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

    // ✅ Step 4: Immediately generate AI summary and title
    // Only attempt if a valid transcript is available and is long enough
    if (transcript && transcript.length > 20) {
      console.log(
        "processAudioEntry: Starting AI summarization and titling..."
      );
      try {
        // Call your existing summarization action
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
        // Continue processing even if AI summarization fails, as it's a secondary step
      }
    } else {
      console.log(
        "processAudioEntry: Transcript too short for AI summarization."
      );
    }

    // Step 5: Mark entry as processed in the database
    console.log("processAudioEntry: Marking entry as processed...");
    const { error: processedError } = await supabase
      .from("entries")
      .update({ processed: true, updated_at: new Date().toISOString() })
      .eq("id", createdOrUpdatedEntry.id)
      .eq("user_id", user.id); // Ensure only the owner can mark as processed

    if (processedError) {
      console.error(
        "processAudioEntry: Failed to mark entry as processed:",
        processedError
      );
      // This is a non-critical error, so we don't block the main success return
    }
    console.log("processAudioEntry: Entry marked as processed.");

    // Return success and relevant data
    console.log("processAudioEntry: Audio processing completed successfully.");
    return {
      success: true,
      entry: createdOrUpdatedEntry,
      audioUrl, // This is the public URL stored in the DB for client playback
      transcript,
    };
  } catch (err: any) {
    console.error(
      "processAudioEntry: Caught unexpected error during audio processing:",
      err
    );
    // Catch any unexpected errors during the entire process
    return {
      success: false,
      error: "Unexpected error during audio processing.",
    };
  }
}
