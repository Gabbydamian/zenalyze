"use client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is my data private?",
    a: "Yes. All your data is encrypted and you have full control over export and deletion.",
  },
  {
    q: "Can I export my entries?",
    a: "Absolutely! You can export your data as JSON or CSV anytime.",
  },
  {
    q: "How is the AI trained?",
    a: "We use state-of-the-art, privacy-focused models for emotion and sentiment analysis.",
  },
  {
    q: "What file formats do you support?",
    a: "We support all major formats including PDF, DOCX, TXT, and more. Our AI can extract insights from virtually any text-based document.",
  },
  {
    q: "Can I use ClareAi with my existing tools?",
    a: "Yes! We offer seamless integrations with popular platforms and APIs. You can also export your data to use with your existing analytics tools.",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "Our AI models achieve over 95% accuracy in sentiment and emotion analysis. We continuously improve our models based on user feedback and new data.",
  },
];

export function FAQSection() {
  return (
    <section className="relative py-16 bg-[var(--color-card)]/70 bg-dot-pattern">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[var(--color-muted-foreground)] text-lg">
            Everything you need to know about ClareAi
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-[var(--color-card)]/70 rounded-2xl border border-[var(--color-border)] shadow-sm backdrop-blur overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 text-left font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-[var(--color-muted-foreground)] leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
        {/* 
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <p className="text-[var(--color-muted-foreground)] mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
          >
            Contact Us
          </a>
        </motion.div> */}
      </div>
    </section>
  );
}
