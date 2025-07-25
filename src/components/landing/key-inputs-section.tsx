"use client";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * KeyInputsSection - Shows the three main input modes: text, voice, mood.
 */
export function KeyInputsSection() {
const features = [
  {
    icon: (
      <Image
        src="https://images.unsplash.com/photo-1569360531163-a61fa3da86ee?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0"
        alt="Text Journaling"
        className="rounded-lg mx-auto aspect-video object-cover"
        width={500}
        height={300}
      />
    ),
    title: "Text Journaling",
    desc: "Capture thoughts with a focused, minimalist editor that saves your progress automatically. Free-write to reflect deeply, your way.",
  },
  {
    icon: (
      <Image
        src="https://images.unsplash.com/photo-1650654631729-ce2fe3a00d1d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0"
        alt="Voice Entries"
        className="rounded-lg mx-auto aspect-video object-cover"
        width={500}
        height={300}
      />
    ),
    title: "Voice Entries",
    desc: "Speak freely when typing feels like too much. Record your voice and let our AI convert it into text — hands-free, human-first journaling.",
  },
  {
    icon: (
      <Image
        src="https://images.unsplash.com/photo-1582801396492-705377f39876?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0"
        alt="Mood Check-ins"
        className="rounded-lg mx-auto aspect-video object-cover"
        width={500}
        height={300}
      />
    ),
    title: "Mood Check-ins",
    desc: "A quick pulse on how you're feeling. Log your mood in seconds using a slider and emotion chips — then track patterns over time effortlessly.",
  },
];


  return (
    <section className="relative py-20 bg-[var(--color-card)]/70 bg-dot-pattern">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-4 text-[var(--color-foreground)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Input your thoughts, your way.
        </motion.h2>
        <motion.p
          className="text-center text-[var(--color-muted-foreground)] mb-12 max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          {/* Whether you're deep in reflection or just need a quick check-in, we
          adapt to your rhythm. */}
          Whether you're deep in reflection or just need a quick check-in, Clare
          adapts to your rhythm — text, voice, or mood-based.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="flex flex-col items-center bg-white dark:bg-[var(--color-card)] rounded-2xl p-8 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.7, ease: "easeOut" }}
            >
              <div className="mb-6">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-foreground)] text-center">
                {f.title}
              </h3>
              <p className="text-[var(--color-muted-foreground)] text-center leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
