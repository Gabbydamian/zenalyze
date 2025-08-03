"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import {
  createJournalEntry,
  getRecentEntries,
  updateJournalEntry,
} from "@/app/actions/journal-actions";
import { summarizeAndTitleEntry } from "@/app/actions/insights";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { JournalEntry } from "@/types/entries";
import {
  Undo,
  Redo,
  Save,
  Loader2,
  Plus,
  FileText,
  SmilePlus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "./ui/slider";

type EditorState = {
  entryId: string | null;
  lastSavedText: string;
  hasContent: boolean;
  isExpanded: boolean;
  isSaving: boolean;
  lastSaveTime: Date | null;
};

export default function JournalEditor() {
  const [mounted, setMounted] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>({
    entryId: null,
    lastSavedText: "",
    hasContent: false,
    isExpanded: false,
    isSaving: false,
    lastSaveTime: null,
  });
  const [showMoodPopover, setShowMoodPopover] = useState(false);
  const [popoverMood, setPopoverMood] = useState("🤔");
  const [popoverScore, setPopoverScore] = useState(5);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingEntryRef = useRef(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["entries"],
    queryFn: () => getRecentEntries(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-lg focus:outline-none max-w-none text-md text-justify leading-loose h-full outline-none min-h-[100px]",
        "data-placeholder": "Start writing your thoughts here...",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Skip update if we're loading an entry
      if (isLoadingEntryRef.current) {
        return;
      }

      const text = editor.getText().trim();
      const hasRealContent = text.length > 0;

      setEditorState((prev) => ({
        ...prev,
        hasContent: hasRealContent,
        // Auto-expand when user starts typing
        isExpanded: hasRealContent || prev.isExpanded,
      }));

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Only auto-save if there's content and it's different from last saved
      if (hasRealContent && text !== editorState.lastSavedText) {
        typingTimeoutRef.current = setTimeout(() => {
          handleAutoSave(text);
        }, 3000);
      }
    },
    onFocus: () => {
      setEditorState((prev) => ({ ...prev, isExpanded: true }));
    },
  });

  const handleUpdateMood = useCallback(
    async (score: number) => {
      if (!editorState.entryId) {
        toast.error("Entry not found. Cannot save mood.");
        setShowMoodPopover(false);
        return;
      }

      const updateResult = await updateJournalEntry(editorState.entryId, {
        mood_score: score,
      });

      if (updateResult.success) {
        toast.success("Mood and score saved!", { duration: 2000 });
        await refetch();
      } else {
        console.error("Failed to update mood:", updateResult.error);
        toast.error("Failed to save mood. Please try again.");
      }
      setShowMoodPopover(false);
    },
    [editorState.entryId, refetch]
  );

  const handleAutoSave = useCallback(
    async (text: string) => {
      if (!text || text === editorState.lastSavedText || editorState.isSaving) {
        return;
      }

      setEditorState((prev) => ({ ...prev, isSaving: true }));

      try {
        if (!editorState.entryId) {
          // Create new entry
          const result = await createJournalEntry({
            raw_text: text,
            transcript: text, // For text entries, transcript is same as raw_text
            audio_url: null,
            category_ids: [],
            mood_score: null,
            entry_type: "text",
            processed: false, // Initial state for new text entry
          });

          if (result.success && result.data?.id) {
            setEditorState((prev) => ({
              ...prev,
              entryId: result.data.id,
              lastSavedText: text,
              isSaving: false,
              lastSaveTime: new Date(),
            }));
            toast.success("Entry created and saved.", {
              duration: 2000,
            });
            await refetch();
          } else {
            throw new Error(result.error || "Failed to create entry");
          }
        } else {
          // Update existing entry
          const result = await updateJournalEntry(editorState.entryId, {
            raw_text: text,
            transcript: text, // For text entries, transcript is same as raw_text
          });

          if (result.success) {
            setEditorState((prev) => ({
              ...prev,
              lastSavedText: text,
              isSaving: false,
              lastSaveTime: new Date(),
            }));
            toast.success("Changes saved.", {
              duration: 2000,
            });
            await refetch();
          } else {
            throw new Error(result.error || "Failed to update entry");
          }
        }
      } catch (error) {
        console.error("Auto-save error:", error);
        setEditorState((prev) => ({ ...prev, isSaving: false }));
        toast.error("Auto-save failed. Please try manual save.", {
          duration: 4000,
        });
      }
    },
    [
      editorState.entryId,
      editorState.lastSavedText,
      editorState.isSaving,
      refetch,
    ]
  );

  const handleManualSave = useCallback(async () => {
    if (!editor) return;

    const text = editor.getText().trim();
    if (!text) {
      toast.error("Cannot save empty entry.");
      return;
    }

    if (text === editorState.lastSavedText) {
      toast.info("No changes to save.");
      return;
    }

    // Clear auto-save timeout since we're manually saving
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Save the entry first (this will update lastSavedText and isSaving state)
    // The auto-save function will handle the actual DB call and state updates
    await handleAutoSave(text);

    // After auto-save, check if an entryId exists and if content is sufficient for AI
    if (editorState.entryId && text.length > 100) {
      // Show a toast that AI processing is starting
      const processingToast = toast.loading("Generating title and summary...", {
        duration: 10000, // Give it time to complete
      });

      try {
        const result = await summarizeAndTitleEntry(editorState.entryId, text);

        // Dismiss the loading toast
        toast.dismiss(processingToast);

        // Show appropriate success message based on results
        if (result.titleSuccess && result.summarySuccess) {
          toast.success("Entry saved with AI-generated title and summary!", {
            duration: 3000,
          });
        } else if (result.titleSuccess || result.summarySuccess) {
          const successType = result.titleSuccess ? "title" : "summary";
          toast.success(`Entry saved with AI-generated ${successType}.`, {
            description: "Some AI processing was skipped or failed.",
            duration: 3000,
          });
        } else {
          toast.success("Entry saved successfully.", {
            description: "AI processing failed, but your content is safe.",
            duration: 3000,
          });
        }

        // Mark entry as processed after AI insights
        if (result.titleSuccess || result.summarySuccess) {
          const updateProcessedResult = await updateJournalEntry(
            editorState.entryId,
            {
              processed: true,
            }
          );
          if (!updateProcessedResult.success) {
            console.error(
              "Failed to mark text entry as processed:",
              updateProcessedResult.error
            );
            toast.error("Failed to mark entry as processed in DB.", {
              duration: 2000,
            });
          }
        }

        await refetch();
      } catch (error) {
        toast.dismiss(processingToast);
        console.error("AI processing failed:", error);
        toast.success("Entry saved successfully.", {
          description: "AI processing encountered an error.",
          duration: 3000,
        });
      }
    } else if (editorState.entryId) {
      const updateProcessedResult = await updateJournalEntry(
        editorState.entryId,
        {
          processed: true,
        }
      );
      if (!updateProcessedResult.success) {
        console.error(
          "Failed to mark text entry as processed (short content):",
          updateProcessedResult.error
        );
        toast.error("Failed to mark entry as processed in DB.", {
          duration: 2000,
        });
      }
      await refetch();
    }
  }, [
    editor,
    editorState.lastSavedText,
    editorState.entryId,
    editorState.isSaving,
    handleAutoSave,
    refetch,
  ]);

  const handleNewEntry = useCallback(async () => {
    // Save current work if there are unsaved changes
    const currentText = editor?.getText().trim() || "";
    if (
      currentText &&
      currentText !== editorState.lastSavedText &&
      !editorState.isSaving
    ) {
      await handleAutoSave(currentText);
    }

    // Clear all timeouts
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Reset state
    setEditorState({
      entryId: null,
      lastSavedText: "",
      hasContent: false,
      isExpanded: false,
      isSaving: false,
      lastSaveTime: null,
    });
    setShowMoodPopover(false);

    // Clear editor and focus
    editor?.commands.clearContent();

    // Focus after a small delay to ensure state is updated
    setTimeout(() => {
      editor?.commands.focus();
    }, 100);
  }, [editor, editorState.lastSavedText, editorState.isSaving, handleAutoSave]);

  const handleLoadEntry = useCallback(
    async (entry: JournalEntry) => {
      // Prevent editor updates during loading
      isLoadingEntryRef.current = true;

      try {
        // Save current work if there are unsaved changes
        const currentText = editor?.getText().trim() || "";
        if (
          currentText &&
          currentText !== editorState.lastSavedText &&
          !editorState.isSaving
        ) {
          await handleAutoSave(currentText);
        }

        // Clear all timeouts
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Update state first
        setEditorState({
          entryId: entry.id,
          lastSavedText: entry.raw_text || "",
          hasContent: !!entry.raw_text?.trim(),
          isExpanded: true,
          isSaving: false,
          lastSaveTime: entry.updated_at ? new Date(entry.updated_at) : null,
        });

        // Set editor content and focus
        editor?.commands.setContent(entry.raw_text || "");

        // Small delay to ensure content is set before focusing
        setTimeout(() => {
          editor?.commands.focus();
          isLoadingEntryRef.current = false;
        }, 100);
      } catch (error) {
        console.error("Error loading entry:", error);
        isLoadingEntryRef.current = false;
        toast.error("Failed to load entry.");
      }
    },
    [editor, editorState.lastSavedText, editorState.isSaving, handleAutoSave]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleManualSave();
            break;
          case "n":
            e.preventDefault();
            handleNewEntry();
            break;
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              editor?.commands.redo();
            } else {
              e.preventDefault();
              editor?.commands.undo();
            }
            break;
          case "y":
            e.preventDefault();
            editor?.commands.redo();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleManualSave, handleNewEntry]);

  // Cleanup on unmount
  useEffect(() => {
    setMounted(true);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      editor?.destroy();
    };
  }, [editor]);

  // Auto-save before page unload
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      const currentText = editor?.getText().trim() || "";
      if (
        currentText &&
        currentText !== editorState.lastSavedText &&
        !editorState.isSaving
      ) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editor, editorState.lastSavedText, editorState.isSaving]);

  // Sync Popover state with current entry's mood score
  useEffect(() => {
    if (editorState.entryId) {
      const currentEntry = data?.data?.find(e => e.id === editorState.entryId);
      const moodScore = currentEntry?.mood_score || 0;
      setPopoverScore(moodScore);
      setPopoverMood(
        moodScore === 0 ? "🤔" :
        moodScore <= 3 ? "😢" :
        moodScore <= 7 ? "😌" :
        "😊"
      );
    }
  }, [editorState.entryId, data?.data]);


  if (!mounted) return null;

  const hasUnsavedChanges =
    editor?.getText().trim() !== editorState.lastSavedText &&
    editorState.hasContent;

  const currentEntry = data?.data?.find(
    (entry) => entry.id === editorState.entryId
  );
  const currentTitle = currentEntry?.title || "Untitled Entry";
  const moods = ["😊", "😌", "🤔", "😢", "😠"];

  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-[var(--color-foreground)] -mt-2">
        {currentTitle}
      </h2>

      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden lg:block">
            Shortcuts: Save (Ctrl+S) • New (Ctrl+N) • Undo (Ctrl+Z) • Redo
            (Ctrl+Shift+Z)
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                editorState.isSaving
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : hasUnsavedChanges
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              }`}
            >
              {editorState.isSaving
                ? "Saving..."
                : hasUnsavedChanges
                ? "Unsaved"
                : "Saved"}
            </span>
            {editorState.lastSaveTime && (
              <span className="text-zinc-500 dark:text-zinc-400">
                Last saved:{" "}
                {editorState.lastSaveTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
        <Button onClick={handleNewEntry} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Editor */}
      <div
        className={`rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-inner focus-within:ring-2 ring-[#db6371] transition-all duration-500 ease-out overflow-hidden ${
          editorState.isExpanded ? "h-96" : "h-32"
        }`}
      >
        <div className="h-full flex flex-col relative">
          <div className="flex-1 p-6 overflow-auto">
            <EditorContent editor={editor} className="h-full" />
          </div>
          {editorState.isSaving && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => editor?.commands.undo()}
          disabled={!editor?.can().undo()}
          className="aspect-square"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => editor?.commands.redo()}
          disabled={!editor?.can().redo()}
          className="aspect-square"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </Button>

        {/* Mood Popover */}
        {editorState.entryId && (
          <Popover open={showMoodPopover} onOpenChange={setShowMoodPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                title="Set Mood"
                onClick={() => {
                  setShowMoodPopover(true);
                  const currentMoodScore = currentEntry?.mood_score || 0;
                  setPopoverScore(currentMoodScore);
                  setPopoverMood(
                    currentMoodScore === 0 ? "🤔" :
                    currentMoodScore <= 3 ? "😢" :
                    currentMoodScore <= 7 ? "😌" :
                    "😊"
                  );
                }}
              >
                <SmilePlus className="w-4 h-4" />
                Set Mood
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">How are you feeling?</h4>
                  <span className="text-2xl">{popoverMood}</span>
                </div>
                <div className="flex gap-2 justify-around">
                  {moods.map((m) => (
                    <Button
                      key={m}
                      variant="ghost"
                      className={`text-2xl p-2 rounded-full ${
                        popoverMood === m ? "bg-gray-200 dark:bg-gray-700" : ""
                      }`}
                      onClick={() => setPopoverMood(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">
                    Mood Score: <span className="font-medium">{popoverScore} / 10</span>
                  </label>
                  <Slider
                    defaultValue={[popoverScore]}
                    value={[popoverScore]}
                    max={10}
                    step={1}
                    onValueChange={(val) => setPopoverScore(val[0])}
                  />
                </div>
                <Button onClick={() => handleUpdateMood(popoverScore)}>Save Mood</Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {/* Manual Save Button */}
        <Button
          onClick={handleManualSave}
          disabled={
            !editorState.hasContent ||
            !hasUnsavedChanges ||
            editorState.isSaving
          }
          className="flex items-center gap-2"
          title="Save (Ctrl+S)"
        >
          {editorState.isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </Button>
      </div>

      {/* Recent Entries */}
      <div className="animate-in slide-in-from-top-2 duration-300">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" />
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              Recent Entries
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto px-2 py-1">
            {isLoading ? (
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading recent entries...
              </div>
            ) : error ? (
              <p className="text-red-500 dark:text-red-400">
                Error loading entries. Please refresh the page.
              </p>
            ) : !data?.data?.length ? (
              <p className="text-zinc-500 dark:text-zinc-400">
                No recent entries found. Start writing your first entry above!
              </p>
            ) : (
              data.data.map((entry: JournalEntry) => (
                <div
                  key={entry.id}
                  onClick={() => handleLoadEntry(entry)}
                  className={`p-3 bg-white dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600 cursor-pointer hover:ring-2 ring-primary/40 transition-all duration-200 ${
                    entry.id === editorState.entryId
                      ? "ring-2 ring-[#db6371]"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.title || "Untitled Entry"}
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
                    {entry.raw_text || "Empty entry"}
                  </p>
                  {entry.id === editorState.entryId && (
                    <div className="mt-2 text-xs text-[#db6371] font-medium">
                      Currently editing
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