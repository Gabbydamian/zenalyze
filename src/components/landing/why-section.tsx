"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function WhySection() {
  const features = [
    {
      icon: (
        <Image
          src="https://images.unsplash.com/photo-1598826739205-d09823c3bc3d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Mindful Reflection"
          className="rounded-lg mx-auto aspect-video object-cover"
          width={500}
          height={300}
        />
      ),
      title: "Mindful Reflection",
      desc: "Clare helps you pause, breathe, and reconnect. Clarity begins with presence.",
    },
    {
      icon: (
        <Image
          src="https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Pattern Recognition"
          className="rounded-lg mx-auto aspect-video object-cover"
          width={500}
          height={300}
        />
      ),
      title: "Advanced Pattern Recognition",
      desc: "Clare identifies emotional loops and recurring thoughts. Recognize what drives your moods.",
    },
    {
      icon: (
        <Image
          src="https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Privacy by Design"
          className="rounded-lg mx-auto aspect-video object-cover"
          width={500}
          height={300}
        />
      ),
      title: "Privacy by Design",
      desc: "Everything you journal stays yours. Fully encrypted. Never shared.",
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
