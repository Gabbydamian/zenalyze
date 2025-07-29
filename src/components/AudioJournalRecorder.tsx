// src/components/AudioJournalRecorder.tsx

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Mic,
  StopCircle,
  Upload,
  Play,
  Pause,
  Save,
  Loader2,
  FileAudio,
  Plus,
} from "lucide-react";
import { JournalEntry } from "@/types/entries";
import {
  updateJournalEntry,
  getRecentEntries,
} from "@/app/actions/journal-actions";
import { processAudioEntry } from "@/app/actions/audio";
import { summarizeAndTitleEntry } from "@/app/actions/insights";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// REMOVE THIS LINE: import { convertToMp3 } from "@/lib/audioConverter";

type RecorderState = {
  isRecording: boolean;
  isPlaying: boolean;
  isLoadingTranscription: boolean;
  isSavingTranscript: boolean;
  audioUrl: string | null;
  currentEntryId: string | null;
  transcript: string;
  lastSavedTranscript: string;
  lastSaveTime: Date | null;
  hasAudioContent: boolean;
};

export default function AudioJournalRecorder() {
  const [mounted, setMounted] = useState(false);
  const [recorderState, setRecorderState] = useState<RecorderState>({
    isRecording: false,
    isPlaying: false,
    isLoadingTranscription: false,
    isSavingTranscript: false,
    audioUrl: null,
    currentEntryId: null,
    transcript: "",
    lastSavedTranscript: "",
    lastSaveTime: null,
    hasAudioContent: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const transcriptTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();

  // Fetches recent entries, filtered to only show 'voice' type
  const {
    data: recentEntriesData,
    isLoading: isLoadingRecentEntries,
    error: recentEntriesError,
  } = useQuery({
    queryKey: ["entries"],
    queryFn: () => getRecentEntries(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    select: (data) =>
      data.data?.filter((entry) => entry.entry_type === "voice") || [],
  });

  const startRecording = async () => {
    try {
      // Use 'audio/webm' as it's widely supported and efficient
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm", // Ensure the type matches what was recorded
        });
        const url = URL.createObjectURL(audioBlob); // Create a temporary URL for immediate playback
        setRecorderState((prev) => ({
          ...prev,
          audioUrl: url,
          hasAudioContent: true,
          isRecording: false,
        }));
        // --- IMPORTANT CHANGE HERE: Convert Blob to File before processing ---
        const recordedFile = new File(
          [audioBlob],
          `recorded_audio_${Date.now()}.webm`,
          {
            type: audioBlob.type,
            lastModified: Date.now(),
          }
        );
        handleProcessAudio(recordedFile); // Pass the File object
      };

      mediaRecorderRef.current.start();
      setRecorderState((prev) => ({
        ...prev,
        isRecording: true,
        isPlaying: false,
        audioUrl: null, // Clear previous audio
        transcript: "", // Clear previous transcript
        lastSavedTranscript: "",
        hasAudioContent: false,
        currentEntryId: null, // This ensures a new entry is created for new recordings
        lastSaveTime: null,
      }));
      toast.info("Recording started...", { duration: 1500 });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone. Please allow access.", {
        duration: 4000,
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      toast.success("Recording stopped. Preparing for processing...", {
        duration: 1500,
      });
    }
  };

  const playAudio = () => {
    if (recorderState.audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.play();
      setRecorderState((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const pauseAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setRecorderState((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const handleAudioEnded = () => {
    setRecorderState((prev) => ({ ...prev, isPlaying: false }));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setRecorderState((prev) => ({
        ...prev,
        audioUrl: URL.createObjectURL(file), // Show immediate preview
        hasAudioContent: true,
        transcript: "",
        lastSavedTranscript: "",
        currentEntryId: null, // New entry for new upload
        lastSaveTime: null,
      }));
      toast.info("Audio file loaded. Processing...", { duration: 2000 });
      // Trigger the comprehensive audio processing action directly with the File
      handleProcessAudio(file); // file is already a File object
    } else {
      toast.error("Please select a valid audio file.", { duration: 3000 });
    }
  };

  // This function now directly calls the backend action without client-side conversion
  const handleProcessAudio = useCallback(
    async (audioFile: File) => {
      // Changed type hint to File
      setRecorderState((prev) => ({
        ...prev,
        isLoadingTranscription: true,
        isSavingTranscript: true, // Also set saving since it's part of the initial save
      }));
      toast.loading(
        "Uploading, transcribing, and saving entry...", // Updated toast message
        {
          id: "audio-process-toast",
          duration: 0,
        }
      );

      try {
        // Directly call the unified server action with the audio File
        const result = await processAudioEntry(
          audioFile, // Pass the File object directly
          recorderState.currentEntryId
        );

        if (result.success && result.entry) {
          setRecorderState((prev) => ({
            ...prev,
            audioUrl: result.audioUrl || null,
            transcript: result.transcript || "",
            lastSavedTranscript: result.transcript || "",
            isLoadingTranscription: false,
            isSavingTranscript: false, // Processing complete, saving done
            currentEntryId: result.entry?.id || null,
            lastSaveTime: new Date(),
          }));
          toast.success("Audio entry processed and saved!", {
            id: "audio-process-toast",
            duration: 3000,
          });

          // Invalidate queries to refresh the list of recent entries
          await queryClient.invalidateQueries({ queryKey: ["entries"] });
        } else {
          throw new Error(result.error || "Failed to process audio entry.");
        }
      } catch (error: any) {
        console.error("Error processing audio (client or server step):", error);
        setRecorderState((prev) => ({
          ...prev,
          isLoadingTranscription: false,
          isSavingTranscript: false,
        }));
        toast.error(`Audio processing failed: ${error.message}`, {
          id: "audio-process-toast",
          duration: 5000,
        });
      } finally {
        // Revoke the temporary URL created for the initial blob/file if it exists
        // Note: audioFile is now always a File, so we check if its URL was created
        if (
          recorderState.audioUrl &&
          recorderState.audioUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(recorderState.audioUrl);
        }
      }
    },
    [recorderState.currentEntryId, queryClient, recorderState.audioUrl]
  );

  // This function is now specifically for saving manual edits to the transcript
  const handleSaveTranscriptChanges = useCallback(async () => {
    if (!recorderState.currentEntryId || !recorderState.transcript) {
      toast.error("No entry loaded or transcript to save.", { duration: 2000 });
      return;
    }

    if (recorderState.isSavingTranscript) return; // Prevent double saving

    // Check if there are actual changes
    if (
      recorderState.transcript.trim() ===
      recorderState.lastSavedTranscript.trim()
    ) {
      toast.info("No changes to save.", { duration: 1500 });
      return;
    }

    setRecorderState((prev) => ({ ...prev, isSavingTranscript: true }));
    toast.loading("Saving transcript changes...", {
      id: "save-transcript-toast",
      duration: 0,
    });

    try {
      // Use updateJournalEntry from journal-actions for just text updates
      const result = await updateJournalEntry(recorderState.currentEntryId, {
        raw_text: recorderState.transcript,
        transcript: recorderState.transcript,
      });

      if (result.success && result.data?.id) {
        setRecorderState((prev) => ({
          ...prev,
          lastSavedTranscript: recorderState.transcript,
          isSavingTranscript: false,
          lastSaveTime: new Date(),
        }));
        toast.success("Transcript changes saved!", {
          id: "save-transcript-toast",
          duration: 3000,
        });

        // Re-run AI insights if transcript changed and is long enough
        if (recorderState.transcript.length > 20) {
          // Reduced threshold for AI re-run
          toast.loading("Updating AI insights...", {
            id: "ai-audio-toast",
            duration: 0,
          });
          try {
            await summarizeAndTitleEntry(
              result.data.id,
              recorderState.transcript
            );
            toast.dismiss("ai-audio-toast");
            toast.success("AI insights updated!", { duration: 2000 });
          } catch (aiError) {
            console.error("AI analysis for audio failed:", aiError);
            toast.error("Failed to update AI insights.", {
              id: "ai-audio-toast",
              duration: 3000,
            });
          }
        }
        await queryClient.invalidateQueries({ queryKey: ["entries"] });
      } else {
        throw new Error(result.error || "Failed to save transcript changes.");
      }
    } catch (error: any) {
      console.error("Error saving transcript changes:", error);
      setRecorderState((prev) => ({ ...prev, isSavingTranscript: false }));
      toast.error(`Failed to save transcript: ${error.message}`, {
        id: "save-transcript-toast",
        duration: 4000,
      });
    }
  }, [recorderState, queryClient]);

  // Helper to check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return (
      recorderState.transcript.trim() !==
        recorderState.lastSavedTranscript.trim() &&
      recorderState.transcript.trim().length > 0 &&
      recorderState.currentEntryId !== null
    );
  }, [
    recorderState.transcript,
    recorderState.lastSavedTranscript,
    recorderState.currentEntryId,
  ]);

  const handleLoadAudioEntry = useCallback(
    async (entry: JournalEntry) => {
      // If there are unsaved changes on the *current* entry, prompt to save them
      if (
        hasUnsavedChanges() &&
        !recorderState.isSavingTranscript &&
        !recorderState.isLoadingTranscription
      ) {
        const confirmSave = window.confirm(
          "You have unsaved changes in the current entry. Do you want to save them before loading a new entry?"
        );
        if (confirmSave) {
          await handleSaveTranscriptChanges();
        }
      }

      // Stop any ongoing recording or playback
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = ""; // Clear current audio
      }
      if (transcriptTypingTimeoutRef.current) {
        clearTimeout(transcriptTypingTimeoutRef.current);
      }

      // Set state to the loaded entry
      setRecorderState({
        isRecording: false,
        isPlaying: false,
        isLoadingTranscription: false, // Assuming loaded entry is already processed
        isSavingTranscript: false,
        audioUrl: entry.audio_url || null,
        currentEntryId: entry.id,
        transcript: entry.transcript || "",
        lastSavedTranscript: entry.transcript || "",
        lastSaveTime: entry.updated_at
          ? new Date(entry.updated_at)
          : entry.created_at
          ? new Date(entry.created_at)
          : null,
        hasAudioContent: !!entry.audio_url,
      });

      toast.info(`Loaded audio entry: ${entry.title || "Untitled"}`, {
        duration: 2000,
      });
    },
    [recorderState, handleSaveTranscriptChanges, hasUnsavedChanges]
  );

  const handleNewAudioEntry = useCallback(async () => {
    // If there are unsaved changes on the *current* entry, prompt to save them first
    if (
      hasUnsavedChanges() &&
      !recorderState.isSavingTranscript &&
      !recorderState.isLoadingTranscription
    ) {
      const confirmSave = window.confirm(
        "You have unsaved changes in the current entry. Do you want to save them before starting a new one?"
      );
      if (confirmSave) {
        await handleSaveTranscriptChanges();
      }
    }

    // Reset state for a new recording/upload
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = "";
    }
    if (transcriptTypingTimeoutRef.current) {
      clearTimeout(transcriptTypingTimeoutRef.current);
    }

    setRecorderState({
      isRecording: false,
      isPlaying: false,
      isLoadingTranscription: false,
      isSavingTranscript: false,
      audioUrl: null,
      currentEntryId: null, // Crucial: ensures a new entry is created upon next audio process
      transcript: "",
      lastSavedTranscript: "",
      lastSaveTime: null,
      hasAudioContent: false,
    });
    toast.info("Ready for a new audio entry.", { duration: 2000 });
  }, [recorderState, handleSaveTranscriptChanges, hasUnsavedChanges]);

  const handleTranscriptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newTranscript = e.target.value;
      setRecorderState((prev) => ({
        ...prev,
        transcript: newTranscript,
      }));

      // Clear previous timeout and set a new one to auto-save after a delay
      if (transcriptTypingTimeoutRef.current) {
        clearTimeout(transcriptTypingTimeoutRef.current);
      }
      transcriptTypingTimeoutRef.current = setTimeout(() => {
        // Only trigger auto-save if there are actual changes AND an entry is loaded
        if (
          newTranscript.trim() !== recorderState.lastSavedTranscript.trim() &&
          recorderState.currentEntryId
        ) {
          handleSaveTranscriptChanges(); // Call manual save for edits
        }
      }, 3000); // 3-second debounce
    },
    [
      recorderState.lastSavedTranscript,
      recorderState.currentEntryId,
      handleSaveTranscriptChanges,
    ]
  );

  useEffect(() => {
    setMounted(true);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.addEventListener("ended", handleAudioEnded);
    }

    return () => {
      // Cleanup on unmount
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      }
      if (
        recorderState.audioUrl &&
        recorderState.audioUrl.startsWith("blob:")
      ) {
        // Only revoke blob URLs
        URL.revokeObjectURL(recorderState.audioUrl); // Clean up temporary URL
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener("ended", handleAudioEnded);
      }
      if (transcriptTypingTimeoutRef.current) {
        clearTimeout(transcriptTypingTimeoutRef.current);
      }
    };
  }, [recorderState.audioUrl]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        hasUnsavedChanges() &&
        !recorderState.isSavingTranscript &&
        !recorderState.isLoadingTranscription
      ) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?"; // For older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    hasUnsavedChanges,
    recorderState.isSavingTranscript,
    recorderState.isLoadingTranscription,
  ]);

  if (!mounted) return null;

  // Determine overall loading/saving state
  const isBusy =
    recorderState.isLoadingTranscription || recorderState.isSavingTranscript;

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Audio Journal: Record or Upload your thoughts.
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isBusy
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : hasUnsavedChanges()
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                  : recorderState.currentEntryId // Only show saved if an entry exists
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {recorderState.isLoadingTranscription
                ? "Processing Audio..."
                : recorderState.isSavingTranscript
                ? "Saving Transcript..."
                : hasUnsavedChanges()
                ? "Unsaved Transcript"
                : recorderState.currentEntryId
                ? "Saved"
                : "New Entry"}
            </span>
            {recorderState.lastSaveTime && (
              <span className="text-zinc-500 dark:text-zinc-400">
                Last saved:{" "}
                {recorderState.lastSaveTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleNewAudioEntry}
          className="flex items-center gap-2"
          disabled={isBusy || recorderState.isRecording}
        >
          <Plus className="w-4 h-4" />
          New Audio Entry
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {!recorderState.isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isBusy}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="w-4 h-4" /> Record
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-800 text-white"
            disabled={isBusy} // Disable if already processing after recording stops
          >
            <StopCircle className="w-4 h-4" /> Stop
          </Button>
        )}

        <label htmlFor="audio-upload" className="cursor-pointer">
          <Button
            asChild
            variant="outline"
            disabled={recorderState.isRecording || isBusy}
          >
            <div>
              <Upload className="w-4 h-4 mr-2" /> Upload Audio
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={recorderState.isRecording || isBusy}
              />
            </div>
          </Button>
        </label>
      </div>

      {recorderState.audioUrl && (
        <div className="flex items-center gap-2">
          <Button
            onClick={recorderState.isPlaying ? pauseAudio : playAudio}
            disabled={
              recorderState.isLoadingTranscription || !recorderState.audioUrl
            }
            className="aspect-square"
          >
            {recorderState.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <audio
            ref={audioPlayerRef}
            src={recorderState.audioUrl}
            className="w-full"
          />
        </div>
      )}

      <div
        className={`rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-inner focus-within:ring-2 ring-[#db6371] transition-all duration-300 ease-out overflow-hidden`}
      >
        <div className="h-full flex flex-col relative">
          <textarea
            value={recorderState.transcript}
            onChange={handleTranscriptChange}
            placeholder={
              recorderState.isLoadingTranscription
                ? "Transcribing your audio and saving..."
                : recorderState.hasAudioContent
                ? "Your transcribed text will appear here. You can edit it too."
                : "Record or upload audio to get started."
            }
            className="flex-1 p-6 overflow-auto bg-transparent focus:outline-none text-md text-justify leading-loose h-full min-h-[150px] resize-y"
            disabled={
              recorderState.isLoadingTranscription || recorderState.isRecording
            }
          />
          {isBusy && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex justify-end gap-2">
        <Button
          onClick={handleSaveTranscriptChanges}
          disabled={
            !recorderState.currentEntryId || // No entry loaded to save for
            isBusy ||
            !hasUnsavedChanges() // Only enable if there are changes
          }
          className="flex items-center gap-2"
          title="Save Transcript Changes"
        >
          {recorderState.isSavingTranscript ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="animate-in slide-in-from-top-2 duration-300">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileAudio className="w-4 h-4" />
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              Recent Audio Entries
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto px-2 py-1">
            {isLoadingRecentEntries ? (
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading recent audio entries...
              </div>
            ) : recentEntriesError ? (
              <p className="text-red-500 dark:text-red-400">
                Error loading audio entries. Please refresh the page.
              </p>
            ) : !recentEntriesData?.length ? (
              <p className="text-zinc-500 dark:text-zinc-400">
                No recent audio entries found. Record or upload your first entry
                above!
              </p>
            ) : (
              recentEntriesData.map((entry: JournalEntry) => (
                <div
                  key={entry.id}
                  onClick={() => handleLoadAudioEntry(entry)}
                  className={`p-3 bg-white dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600 cursor-pointer hover:ring-2 ring-primary/40 transition-all duration-200 ${
                    entry.id === recorderState.currentEntryId
                      ? "ring-2 ring-[#db6371]" // Highlight currently loaded entry
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.title || "Untitled Audio Entry"}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.updated_at
                        ? new Date(entry.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : entry.created_at
                        ? new Date(entry.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown time"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
                    {entry.transcript || "No transcript available."}
                  </p>
                  {entry.id === recorderState.currentEntryId && (
                    <div className="mt-2 text-xs text-[#db6371] font-medium">
                      Currently editing (audio)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
