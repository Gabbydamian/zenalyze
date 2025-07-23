"use client";
import { motion } from "framer-motion";

export function DashboardSection() {
  return (
    <section className="relative py-20 bg-[var(--color-card)]/70 bg-dot-pattern">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row-reverse items-center gap-12">
        {/* Mockup */}
        <motion.div
          className="flex justify-center w-1/2 md:w-2/5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="rounded-3xl bg-[var(--color-background)] backdrop-blur-lg p-4 border border-[var(--color-border)] w-fit h-fit flex flex-col items-center justify-center">
            <img
              src="https://cdn.dribbble.com/userupload/29871531/file/original-9cc16e5d17808a8b63cbbea65daf2bed.png?format=webp&resize=640x480&vertical=center"
              alt="Dashboard preview"
              className="rounded-2xl w-[400px] h-[300px] object-cover"
            />
          </div>
        </motion.div>
        {/* Text */}
        <motion.div
          className="w-1/2 md:w-3/5"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--color-foreground)]">
            Your insights, visualized.
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-6 text-lg">
            Understand yourself better with interactive, easy-to-digest
            analytics powered by your own words and moods.
          </p>
          <ul className="space-y-3 text-base list-disc list-inside">
            <li>Colorful emotion charts and mood tracking</li>
            <li>Weekly summaries and pattern recognition</li>
            <li>Trigger identification and thought loop detection</li>
            <li>Beautiful, intuitive dashboard design</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
