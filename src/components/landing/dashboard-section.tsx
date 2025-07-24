"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function DashboardSection() {
  return (
    <section className="relative py-20 bg-[var(--color-card)]/70 bg-dot-pattern">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row-reverse items-center gap-12">
        {/* Mockup */}
        <motion.div
          className="flex justify-center w-full md:w-2/5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="rounded-3xl bg-[var(--color-background)] backdrop-blur-lg p-4 border border-[var(--color-border)] w-fit h-fit flex flex-col items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fGRhc2hib2FyZHxlbnwwfHwwfHx8MA%3D%3D"
              alt="Dashboard preview"
              className="rounded-2xl w-[400px] h-[300px] object-cover"
              width={400}
              height={300}
            />
            {/* <img
              src="https://cdn.dribbble.com/userupload/29871531/file/original-9cc16e5d17808a8b63cbbea65daf2bed.png?format=webp&resize=640x480&vertical=center"
              alt="Dashboard preview"
              className="rounded-2xl w-[400px] h-[300px] object-cover"
            /> */}
          </div>
        </motion.div>
        {/* Text */}
        <motion.div
          className="w-full md:w-3/5 px-2 md:px-0"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--color-foreground)] text-center md:text-left">
            Your insights, visualized.
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-6 text-lg text-center md:text-left">
            Understand yourself better with interactive, easy-to-digest
            analytics powered by your own words and moods.
          </p>
          <ul className="space-y-3 text-base list-disc list-inside text-center md:text-left text-[var(--color-muted-foreground)]">
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
