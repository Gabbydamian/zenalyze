"use client";
import { motion } from "framer-motion";

/**
 * KeyInputsSection - Shows the three main input modes: text, voice, mood.
 */
export function KeyInputsSection() {
  const features = [
    {
      icon: (
        <img
          src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=120&h=120&facepad=2&q=80"
          alt="Text Journaling"
          className="rounded-2xl w-20 h-20 object-cover"
        />
      ),
      title: "Text Journaling",
      desc: "Clean editor, auto-save, templates",
    },
    {
      icon: (
        <img
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=120&h=120&facepad=2&q=80"
          alt="Voice Entries"
          className="rounded-2xl w-20 h-20 object-cover"
        />
      ),
      title: "Voice Entries",
      desc: "Record and auto-transcribe with AI",
    },
    {
      icon: (
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=120&h=120&facepad=2&q=80"
          alt="Mood Check-ins"
          className="rounded-2xl w-20 h-20 object-cover"
        />
      ),
      title: "Mood Check-ins",
      desc: "Quick slider + emotion picker",
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
          Whether you're deep in reflection or just need a quick check-in, we
          adapt to your rhythm.
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
