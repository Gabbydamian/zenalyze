"use client";
import { motion } from "framer-motion";

export function WhySection() {
  const features = [
    {
      icon: (
        <img
          src="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=facearea&w=80&h=80&facepad=2&q=80"
          alt="Mindful Reflection"
          className="rounded-full"
        />
      ),
      title: "Mindful Reflection",
      desc: "Slow down and reconnect",
    },
    {
      icon: (
        <img
          src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=facearea&w=80&h=80&facepad=2&q=80"
          alt="Pattern Recognition"
          className="rounded-full"
        />
      ),
      title: "Pattern Recognition",
      desc: "Track trends and triggers",
    },
    {
      icon: (
        <img
          src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=80&h=80&facepad=2&q=80"
          alt="Privacy by Design"
          className="rounded-full"
        />
      ),
      title: "Privacy by Design",
      desc: "Fully encrypted, you own your data",
    },
  ];
  return (
    <section
      id="features"
      className="relative py-16 bg-[var(--color-background)]"
    >
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-8 text-[var(--color-foreground)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Built for clarity. Backed by science.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="flex flex-col items-center bg-[var(--color-card)]/70 rounded-2xl p-8 backdrop-blur border border-[var(--color-border)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.7, ease: "easeOut" }}
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-foreground)]">
                {f.title}
              </h3>
              <p className="text-[var(--color-muted-foreground)] text-center">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
