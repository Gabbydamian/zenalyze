"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function AIInsightSection() {
  return (
    <section className="relative py-20 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-12 items-center">
        {/* Left: Animated mockup/illustration */}
        <motion.div
          className="flex justify-center w-1/2 md:w-2/5"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="rounded-3xl bg-[var(--color-background)]backdrop-blur-lg border border-[var(--color-border)] w-fit h-fit flex flex-col items-center justify-center p-4">
            <Image
              src="https://images.unsplash.com/photo-1752350435091-57d30c3d8bfc?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width={350}
              height={600}
              alt="AI Insight Preview"
              className="rounded-2xl object-cover"
            />
          </div>
        </motion.div>
        {/* Right: Text and bullets */}
        <motion.div
          className="w-1/2 md:w-3/5"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--color-foreground)]">
            AI that listens — and makes sense of it all.
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-6 text-lg">
            Behind every entry, Clarifai’s AI analyzes sentiment, detects
            emotions, recognizes recurring patterns, and extracts what matters.
            <br />
            It’s like having a personal therapist, data scientist, and coach —
            all in one.
          </p>
          <ul className="space-y-3 text-base list-disc list-inside">
            <li>Sentiment & emotion recognition</li>
            <li>Goal and worry detection</li>
            <li>Entry summarization</li>
            <li>Mood pattern mapping</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
