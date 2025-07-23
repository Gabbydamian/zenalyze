"use client";
import { motion } from "framer-motion";

export function FinalCTASection() {
  return (
    <section className="relative py-20 bg-[var(--color-background)]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Ready to reflect, grow, and feel better?
        </motion.h2>
        <motion.p
          className="text-lg text-[var(--color-muted-foreground)] mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Start your journey to mental clarity in under 60 seconds.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 transition-colors duration-300 ease-in-out hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400"
        >
          Start Journaling Free
        </motion.button>
      </div>
    </section>
  );
}
