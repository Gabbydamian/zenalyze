"use client";
import { motion } from "framer-motion";

/**
 * HeroSection - Top landing section with headline, subtext, CTAs, and animated phone mockup.
 */
export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] py-0 lg:py-16 bg-[var(--color-background)] overflow-hidden px-6 lg:px-0">
      {/* Noise background overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(http://www.transparenttextures.com/patterns/noisy.png)",
          opacity: 0.4,
          mixBlendMode: "multiply",
        }}
      />
      {/* Headline */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-center mb-4 text-[var(--color-foreground)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Clarify your Mind.{" "}
        <span className="font-head bg-gradient-to-r from-orange-500 via-pink-400 to-pink-500 bg-clip-text text-transparent">
          Amplify your Life.
        </span>
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl text-center text-[var(--color-muted-foreground)] max-w-2xl mb-8 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Journal, reflect, and grow with an AI-powered wellness platform that
        helps you understand your thoughts, track your emotions, and unlock
        insight from your day.
      </motion.p>
      <div className="flex flex-col lg:flex-row gap-4">
        <motion.button
          // whileHover={{ scale: 1.05 }}
          className="px-6 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400"
        >
          Start Journaling Free
        </motion.button>
        <motion.button
          // whileHover={{ scale: 1.05 }}
          className="px-6 py-3 rounded-full bg-[var(--color-card)]/60 text-[var(--color-primary)] font-semibold border border-[var(--color-border)] backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gradient-to-r  hover:from-orange-500 hover:via-pink-500 hover:to-pink-400 hover:text-white"
        >
          Watch How It Works
        </motion.button>
      </div>
    </section>
  );
}
