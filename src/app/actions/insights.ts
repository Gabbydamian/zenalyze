/* eslint-disable @typescript-eslint/no-explicit-any */

"use server"
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Authentication required");
    }

    return user;
}

// Request Interface for Hugging Face Router (OpenAI-compatible)
interface RouterChatCompletionRequest {
    model: string;
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    repetition_penalty?: number;
    stream?: boolean;
}

interface HuggingFaceError {
    error: string;
    estimated_time?: number;
}

interface TitleSummaryResponse {
    title: string;
    summary: string;
}

// Type guard for API errors
function isHuggingFaceError(response: unknown): response is HuggingFaceError {
    return typeof response === 'object' &&
        response !== null &&
        'error' in response;
}

// Helper function to calculate text difference percentage
function calculateTextDifference(oldText: string, newText: string): number {
    if (!oldText) return 100;

    const oldLength = oldText.length;
    const newLength = newText.length;

    if (oldLength === 0 && newLength === 0) return 0;
    if (oldLength === 0) return 100;

    const maxLength = Math.max(oldLength, newLength);
    const similarity = oldText === newText ? 0 : Math.max(Math.abs(maxLength - Math.min(oldLength, newLength)), maxLength * 0.1);

    return (similarity / maxLength) * 100;
}

// Simplified Hugging Face API call (Llama only)
async function queryHuggingFace(requestData: RouterChatCompletionRequest): Promise<string> {
    const token = process.env.HF_TOKEN;
    if (!token) {
        throw new Error('HF_TOKEN environment variable is not set');
    }

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error('Hugging Face API Error Response:', JSON.stringify(errorBody, null, 2));
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody.error?.message || errorBody.error || "An error occurred"}`);
    }

    const result: unknown = await response.json();

    if (isHuggingFaceError(result)) {
        throw new Error(`Hugging Face API error: ${result.error}`);
    }

    // Parse OpenAI-compatible chat completions response
    if (typeof result === 'object' && result !== null && 'choices' in result && Array.isArray((result as any).choices) && (result as any).choices.length > 0) {
        const firstChoice = (result as any).choices[0];
        if (typeof firstChoice === 'object' && firstChoice !== null && 'message' in firstChoice && typeof (firstChoice as any).message === 'object' && (firstChoice as any).message !== null && 'content' in (firstChoice as any).message) {
            return (firstChoice as any).message.content as string;
        }
    }

    throw new Error(`Unexpected response format from Hugging Face API: ${JSON.stringify(result)}`);
}

// Primary function using custom delimiters (more reliable)
async function generateTitleAndSummary(text: string): Promise<TitleSummaryResponse> {
    const systemPrompt = `You are a helpful assistant specialized in analyzing journal entries. Your task is to provide a brief, descriptive title (3-8 words) and a concise summary of the main points and themes from the provided journal entry.

CRITICAL: You must respond using this EXACT format with ALL delimiters:

TITLE_START:Your brief descriptive title here:TITLE_END
SUMMARY_START:Your concise summary of the main points and themes here:SUMMARY_END

IMPORTANT:
- You MUST include both opening AND closing delimiters for each section
- Do not include any other text, formatting, or characters in your response
- Use only the format above with ALL FOUR delimiters
- **The title should be a natural, descriptive phrase for the journal entry's content. Do not use words like 'Found', 'Discovered', or 'Entry'.**
- **When referring to the person who wrote the journal entry, use 'the user' or describe their actions directly (e.g., 'The user reflects...', 'They describe...'), avoiding terms like 'the writer' or 'the author'.**`;

    try {
        const chatCompletionRequest: RouterChatCompletionRequest = {
            model: "meta-llama/Llama-3.2-3B-Instruct:novita",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Analyze this journal entry: ${ text } `,
                },
            ],
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 200,
            repetition_penalty: 1.1,
            stream: false,
        };

        const result = await queryHuggingFace(chatCompletionRequest);
        console.log('Raw API response:', result);

        // Extract title and summary using the custom delimiters (with fallback for missing end delimiters)
        const titleMatch = result.match(/TITLE_START:(.*?)TITLE_END/s);
        const summaryMatch = result.match(/SUMMARY_START:(.*?)SUMMARY_END/s);


        if (!titleMatch || !summaryMatch) {
            console.error('Delimiter extraction failed. Response:', result);
            throw new Error('Could not find title or summary delimiters in response');
        }

        const title = titleMatch[1].trim();
        const summary = summaryMatch[1].trim();

        if (!title || !summary) {
            throw new Error('Empty title or summary extracted');
        }

        return {
            title: title.substring(0, 100),
            summary: summary.substring(0, 500)
        };

    } catch (error) {
        console.error("Error in generateTitleAndSummary:", error);
        
        // Fallback to JSON approach if delimiter method fails
        console.log('Delimiter approach failed, falling back to JSON approach');
        return generateTitleAndSummaryFallback(text);
    }
}

// Fallback JSON approach (kept as backup)
async function generateTitleAndSummaryFallback(text: string): Promise<TitleSummaryResponse> {
    const systemPrompt = `You are a helpful assistant specialized in analyzing journal entries. Your task is to provide a brief, descriptive title (3-8 words) and a concise summary of the main points and themes from the provided journal entry.

IMPORTANT: To avoid JSON parsing issues, use backticks(\`) instead of regular quotes in your title and summary content.
**The title should be a natural, descriptive phrase for the journal entry's content. Do not use words like 'Found', 'Discovered', or 'Entry'.**
**When referring to the person who wrote the journal entry, use 'the user' or describe their actions directly (e.g., 'The user reflects...', 'They describe...'), avoiding terms like 'the writer' or 'the author'.**

Respond with this exact format:
{"title": "Brief descriptive title here", "summary": "Concise summary of the main points and themes here"}

Your entire response must be valid JSON only. Do not include any text outside the JSON structure.`;
    try {
        const chatCompletionRequest: RouterChatCompletionRequest = {
            model: "meta-llama/Llama-3.2-3B-Instruct:novita",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Journal entry: ${text}`,
                },
            ],
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 200,
            repetition_penalty: 1.1,
            stream: false,
        };

        const result = await queryHuggingFace(chatCompletionRequest);
        console.log('Fallback API response:', result);

        // Clean and parse JSON
        let cleanResult = result.trim();
        cleanResult = cleanResult.replace(/^```(?:json)?\s*|\s*```$/gm, '').trim();

        const firstBrace = cleanResult.indexOf('{');
        const lastBrace = cleanResult.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
            throw new Error('No valid JSON object found in fallback response');
        }

        const jsonString = cleanResult.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonString) as TitleSummaryResponse;

        if (!parsed || typeof parsed !== 'object' || !parsed.title || !parsed.summary) {
            throw new Error('Invalid response structure from fallback API');
        }

        return {
            title: parsed.title.trim().substring(0, 100).replace(/`/g, "'"),
            summary: parsed.summary.trim().substring(0, 500).replace(/`/g, "'")
        };

    } catch (error) {
        console.error("Fallback generation failed:", error);

        // Ultimate fallback
        return {
            title: "Journal Entry",
            summary: "Unable to generate summary due to parsing error"
        };
    }
}

// Main action function
export async function summarizeAndTitleEntry(
    entryId: string,
    currentText: string
): Promise<{ summarySuccess: boolean; titleSuccess: boolean; error?: string }> {
    try {
        const user = await getCurrentUser();
        const supabase = await createClient();

        // Get existing entry and insights
        const [entryResult, insightsResult] = await Promise.all([
            supabase
                .from("entries")
                .select("id, title, raw_text")
                .eq("id", entryId)
                .eq("user_id", user.id)
                .single(),
            supabase
                .from("insights")
                .select("id, summary, entry_id")
                .eq("entry_id", entryId)
                .single()
        ]);

        if (entryResult.error) {
            return {
                summarySuccess: false,
                titleSuccess: false,
                error: "Entry not found or access denied"
            };
        }

        const existingEntry = entryResult.data;
        const existingInsights = insightsResult.data;

        // Check if we need to generate title or summary
        const needsTitle = !existingEntry.title ||
            calculateTextDifference(existingEntry.raw_text || "", currentText) >= 20;

        const needsSummary = !existingInsights?.summary ||
            calculateTextDifference(existingEntry.raw_text || "", currentText) >= 20;

        // If neither needs generation, return success
        if (!needsTitle && !needsSummary) {
            return {
                summarySuccess: true,
                titleSuccess: true
            };
        }

        // Generate title and summary using the new delimiter approach
        let titleSuccess = !needsTitle;
        let summarySuccess = !needsSummary;

        if (needsTitle || needsSummary) {
            try {
                const generated = await generateTitleAndSummary(currentText);

                if (needsTitle) {
                    const { error: titleError } = await supabase
                        .from("entries")
                        .update({ title: generated.title })
                        .eq("id", entryId)
                        .eq("user_id", user.id);

                    titleSuccess = !titleError;
                    if (titleError) {
                        console.error("Failed to update title:", titleError);
                    }
                }

                if (needsSummary) {
                    if (existingInsights) {
                        const { error: summaryError } = await supabase
                            .from("insights")
                            .update({
                                summary: generated.summary,
                                updated_at: new Date().toISOString()
                            })
                            .eq("entry_id", entryId);

                        summarySuccess = !summaryError;
                        if (summaryError) {
                            console.error("Failed to update summary:", summaryError);
                        }
                    } else {
                        const { error: summaryError } = await supabase
                            .from("insights")
                            .insert({
                                entry_id: entryId,
                                user_id: user.id,
                                summary: generated.summary,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });

                        summarySuccess = !summaryError;
                        if (summaryError) {
                            console.error("Failed to create summary:", summaryError);
                        }
                    }
                }

            } catch (apiError) {
                console.error("API generation failed:", apiError);
                titleSuccess = false;
                summarySuccess = false;
            }
        }

        if (titleSuccess || summarySuccess) {
            revalidatePath('/journal');
            revalidatePath(`/journal/${entryId}`);
        }

        return {
            summarySuccess,
            titleSuccess
        };

    } catch (error) {
        console.error("Summarization action error:", error);
        return {
            summarySuccess: false,
            titleSuccess: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}