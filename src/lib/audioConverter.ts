// src/lib/audioConverter.ts
// This module provides functionality to convert audio files to MP3 format using FFmpeg.

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export async function initFFmpeg() {
    if (!ffmpeg.loaded) {
        await ffmpeg.load({
            coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
        });
    }
    return ffmpeg;
}

export async function convertToMp3(blob: Blob): Promise<File> {
    const ffmpeg = await initFFmpeg();
    const inputName = "input.webm";
    const outputName = "output.mp3";

    await ffmpeg.writeFile(inputName, await fetchFile(blob));
    await ffmpeg.exec(["-i", inputName, "-q:a", "0", "-map", "a", outputName]);

    const data = await ffmpeg.readFile(outputName);
    const mp3Blob = new Blob([data], { type: "audio/mpeg" });

    return new File([mp3Blob], `converted_${Date.now()}.mp3`, {
        type: "audio/mpeg",
    });
}