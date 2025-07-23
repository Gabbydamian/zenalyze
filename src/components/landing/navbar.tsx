"use client";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { Flower } from "lucide-react";
import { useRef } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navbarRef = useRef<HTMLDivElement>(null);

  // Smooth scroll handler with offset for sticky navbar
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const navbar = navbarRef.current;
      const offset = navbar ? navbar.offsetHeight : 64; // fallback to 64px
      const rect = el.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - offset - 8; // 8px extra spacing
      // console.log("Smooth scroll to:", id, "Offset:", offset, "Top:", top);
      // Custom smooth scroll animation
      const start = window.scrollY;
      const change = top - start;
      const duration = 500; // ms
      let currentTime = 0;
      function animateScroll() {
        currentTime += 16;
        const val = easeInOutQuad(currentTime, start, change, duration);
        window.scrollTo(0, val);
        if (currentTime < duration) {
          requestAnimationFrame(animateScroll);
        } else {
          window.scrollTo(0, top);
        }
      }
      function easeInOutQuad(
        t: number,
        b: number,
        c: number,
        d: number
      ): number {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }
      animateScroll();
    } else {
      console.warn("Element not found for id:", id);
    }
  };

  return (
    <nav
      ref={navbarRef}
      className="sticky top-0 z-30 w-full bg-[var(--color-background)]/80 backdrop-blur border-b border-[var(--color-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-head text-xl font-bold text-[var(--color-primary)] hover:text-[#f66774] transition-colors duration-300 ease-in-out"
        >
          {/* You can replace this with an <Image> if you have a logo */}
          <span className="flex items-center gap-2">
            <Flower className="w-6 h-6" /> Zenalyze
          </span>
        </Link>
        {/* Nav links */}
        <div className="hidden md:flex gap-12 items-center">
          <a
            href="#features"
            className="text-[var(--primary)] hover:text-[#f66774] hover:underline transition font-medium"
            onClick={(e) => handleNavClick(e, "features")}
          >
            Features
          </a>
          <a
            href="#docs"
            className="text-[var(--primary)] hover:text-[#f66774] hover:underline transition font-medium"
            onClick={(e) => handleNavClick(e, "docs")}
          >
            Docs
          </a>
          <a
            href="#pricing"
            className="text-[var(--primary)] hover:text-[#f66774] hover:underline transition font-medium"
            onClick={(e) => handleNavClick(e, "pricing")}
          >
            Pricing
          </a>
        </div>
        {/* Dark mode toggle and Signup button */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
          >
            {theme === "dark" ? (
              // Sun icon
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-[var(--color-primary)]"
              >
                <circle cx="12" cy="12" r="5" strokeWidth="2" />
                <path
                  strokeWidth="2"
                  d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"
                />
              </svg>
            ) : (
              // Moon icon
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-[var(--color-primary)]"
              >
                <path
                  strokeWidth="2"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                />
              </svg>
            )}
          </button>
          <Link href="/auth/sign-up">
            <button className="px-6 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400 hover:text-white">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
