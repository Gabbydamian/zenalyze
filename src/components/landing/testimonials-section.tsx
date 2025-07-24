"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah K., Product Manager",
    quote:
      "Clarifai helped me spot burnout before it hit me. Now I journal daily.",
    avatar:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=48&h=48&facepad=2&q=80",
  },
  {
    name: "Jide O., Designer",
    quote:
      "I used to journal sporadically. Now I never miss a day. The insights are invaluable.",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=48&h=48&facepad=2&q=80",
  },
  {
    name: "Lina S., Therapist",
    quote:
      "The mood tracking is genius. It feels like the app knows me. I recommend it to all my clients.",
    avatar:
      "https://images.unsplash.com/photo-1659377229079-8f0b34c64077?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmVzc2lvbmElQzQlQkN3b21hbiUyMDUwc3xlbnwwfHwwfHx8MA%3D%3D",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-16 bg-[var(--color-card)]/70 bg-dot-pattern">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-8 text-[var(--color-foreground)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          What early users are saying
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="flex flex-col items-center bg-[var(--color-card)]/70 rounded-2xl p-8 backdrop-blur border border-[var(--color-border)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.7, ease: "easeOut" }}
            >
              <Image
                src={t.avatar}
                alt="User avatar"
                className="rounded-full mb-2 aspect-square object-cover"
                width={72}
                height={72}
              />
              <p className="text-[var(--color-muted-foreground)] text-center mb-4">
                “{t.quote}”
              </p>
              <div className="text-sm text-[var(--color-foreground)]">
                {t.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
