// src/lib/audioConverter.ts
// This module provides functionality to convert audio files to MP3 format using FFmpeg.

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null; // Use a single FFmpeg instance and manage its loading state

export async function initFFmpeg(): Promise<FFmpeg> {
    if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        // Attach log event listener for debugging.
        // In v0.12.x, general errors are often reported via the 'log' event as well.
        ffmpeg.on('log', ({ type, message }: { type: string; message: string }) => {
            // 'type' can be 'fferr' for errors, 'ffout' for stdout, etc.
            if (type === 'fferr') {
                console.error(`FFmpeg stderr: ${message}`);
            } else {
                console.log(`FFmpeg stdout: ${message}`);
            }
        });
        // There is no direct 'error' event in v0.12.x for FFmpeg instance itself.
        // Errors from load/exec are thrown as exceptions.
    }
    if (!ffmpeg.loaded) {
        try {
            await ffmpeg.load({
                coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
            });
            console.log("FFmpeg core loaded successfully.");
        } catch (error) {
            console.error("Failed to load FFmpeg core:", error);
            throw new Error("Failed to initialize audio converter.");
        }
    }
    return ffmpeg;
}

export async function convertToMp3(blob: Blob): Promise<File> {
    if (!blob || !(blob instanceof Blob)) {
        throw new Error("Invalid input: A Blob is required for conversion.");
    }

    const currentFFmpeg = await initFFmpeg(); // Ensure FFmpeg is initialized

    const inputName = "input.webm"; // Assuming input is typically webm from browser recordings
    const outputName = "output.mp3";

    try {
        // Write the input blob to FFmpeg's virtual file system
        await currentFFmpeg.writeFile(inputName, await fetchFile(blob));

        // Execute FFmpeg command to convert to MP3.
        console.log(`Starting FFmpeg conversion of ${inputName} to ${outputName}...`);
        await currentFFmpeg.exec(["-i", inputName, "-q:a", "0", "-map", "a", outputName]);
        console.log("FFmpeg conversion completed.");

        // Read the output MP3 data
        const data = await currentFFmpeg.readFile(outputName);

        // Ensure data is an instance of Uint8Array for Blob creation
        if (!(data instanceof Uint8Array)) {
            throw new Error("FFmpeg readFile did not return expected Uint8Array data.");
        }

        const mp3Blob = new Blob([data], { type: "audio/mpeg" });

        return new File([mp3Blob], `converted_${Date.now()}.mp3`, {
            type: "audio/mpeg",
        });
    } catch (error: any) {
        console.error("Error during audio conversion to MP3:", error);
        throw new Error(`Audio conversion failed: ${error.message || "Unknown error"}`);
    }
}