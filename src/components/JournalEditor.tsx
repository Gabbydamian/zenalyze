"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  createJournalEntry,
  getRecentEntries,
  updateJournalEntry,
} from "@/app/actions/journal-actions";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { JournalEntry } from "@/types/entries";
import { Undo, Redo, Save } from "lucide-react";

export default function JournalEditor() {
  const [mounted, setMounted] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>("");
  const [hasContent, setHasContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["entries"],
    queryFn: () => getRecentEntries(),
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-lg focus:outline-none max-w-none text-md text-justify leading-loose h-full outline-none",
        "data-placeholder": "Start writing your thoughts here...",
      },
    },
    immediatelyRender: false,
    onUpdate: async ({ editor }) => {
      const text = editor.getText().trim();
      const hasRealContent = text.length > 0;
      setHasContent(hasRealContent);

      if (!hasRealContent) return;

      if (text !== lastSavedText) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(async () => {
          if (!entryId) {
            const result = await createJournalEntry({
              raw_text: text,
              transcript: text,
              audio_url: null,
              category_ids: [],
              mood_score: null,
              entry_type: "text",
            });
            if (result.success && result.data?.id) {
              setEntryId(result.data.id);
              setLastSavedText(text);
              toast.success("Entry autosaved.");
              await refetch();
            }
          } else {
            const result = await updateJournalEntry(entryId, {
              raw_text: text,
              transcript: text,
            });
            if (result.success) {
              setLastSavedText(text);
              toast.success("Changes autosaved.");
              await refetch();
            }
          }
        }, 3000);
      }
    },
  });

  const handleManualSave = async () => {
    if (!editor) return;
    const text = editor.getText().trim();
    if (!text) {
      toast.error("Cannot save empty entry.");
      return;
    }

    if (!entryId) {
      const result = await createJournalEntry({
        raw_text: text,
        transcript: text,
        audio_url: null,
        category_ids: [],
        mood_score: null,
        entry_type: "text",
      });
      if (result.success && result.data?.id) {
        setEntryId(result.data.id);
        setLastSavedText(text);
        toast.success("Entry saved.");
        await refetch();
      }
    } else {
      const result = await updateJournalEntry(entryId, {
        raw_text: text,
        transcript: text,
      });
      if (result.success) {
        setLastSavedText(text);
        toast.success("Entry updated.");
        await refetch();
      }
    }
  };

  const handleNewEntry = () => {
    setEntryId(null);
    setLastSavedText("");
    setHasContent(false);
    setIsExpanded(false);
    editor?.commands.clearContent();
    editor?.commands.focus();
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between items-center">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Undo: Ctrl+Z | Redo: Ctrl+Shift+Z | Manual Save Available
        </span>
        <Button onClick={handleNewEntry}>New Entry</Button>
      </div>

      <div
        className={`rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-inner focus-within:ring-2 ring-[#db6371] transition-all duration-500 ease-out overflow-hidden ${
          isExpanded ? "h-96" : "h-32"
        }`}
      >
        <div className="h-full flex flex-col relative">
          <div className="flex-1 p-6 overflow-auto">
            <EditorContent editor={editor} className="h-full" />
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => editor?.commands.undo()}
          disabled={!editor?.can().undo()}
          className="aspect-square"
        >
          <Undo />
        </Button>
        <Button
          variant="secondary"
          onClick={() => editor?.commands.redo()}
          disabled={!editor?.can().redo()}
          className="aspect-square"
        >
          <Redo />
        </Button>
        <Button
          onClick={handleManualSave}
          disabled={!hasContent || editor?.getText().trim() === lastSavedText}
          className="flex items-center gap-2"
        >
          <Save />
          Save
        </Button>
      </div>

      <div className="animate-in slide-in-from-top-2 duration-300">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3">
            Recent Entries
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-zinc-500 dark:text-zinc-400">
                Loading recent entries...
              </p>
            ) : error ? (
              <p className="text-red-500 dark:text-red-400">
                Error loading entries.
              </p>
            ) : !data?.data?.length ? (
              <p className="text-zinc-500 dark:text-zinc-400">
                No recent entries found.
              </p>
            ) : (
              data.data.map((entry: JournalEntry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString()
                        : "Unknown date"}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown time"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
                    {entry.raw_text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
