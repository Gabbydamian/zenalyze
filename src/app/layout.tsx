import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const montserrat = Montserrat({
  variable: "--montserrat",
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  variable: "--barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Zenalyze – AI Journaling, Mood Tracking & Emotion Analysis App",
  description:
    "AI-powered journaling app that helps you track moods, analyze emotions, and discover mental wellness patterns to boost clarity, focus, and productivity.",
  keywords: [
    "AI journaling app",
    "mood tracking platform",
    "emotion analysis tool",
    "personal productivity AI",
    "mental wellness tracker",
    "daily check-in app",
    "AI mental health assistant",
    "voice journaling with transcription",
    "insight-based journaling",
    "self-awareness app",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta
            property="og:title"
            content="Zenalyze – AI Journaling, Mood Tracking & Emotion Analysis App"
          />
          <meta
            property="og:description"
            content="AI-powered journaling app that helps you track moods, analyze emotions, and discover mental wellness patterns to boost clarity, focus, and productivity."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://zenalyze.vercel.app/" />
          <meta
            property="og:image"
            content="https://zenalyze.vercel.app/og-image.png"
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Zenalyze – AI Journaling, Mood Tracking & Emotion Analysis App"
          />
          <meta
            name="twitter:description"
            content="AI-powered journaling app that helps you track moods, analyze emotions, and discover mental wellness patterns to boost clarity, focus, and productivity."
          />
          <meta
            name="twitter:image"
            content="https://zenalyze.vercel.app/og-image.png"
          />
          <meta
            name="keywords"
            content="AI journaling app, mood tracking platform, emotion analysis tool, personal productivity AI, mental wellness tracker, daily check-in app, AI mental health assistant, voice journaling with transcription, insight-based journaling, self-awareness app"
          />
        </head>
        <body
          className={`
            ${montserrat.variable} 
            ${barlow.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ThemeProvider>
  );
}
