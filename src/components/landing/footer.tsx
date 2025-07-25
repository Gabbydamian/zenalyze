"use client";
import Link from "next/link";
import { Flower, Mail, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-card)] border-t border-[var(--color-border)] mt-20">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-head text-xl font-bold text-[var(--color-primary)] hover:text-[#f66774] transition-colors duration-300 ease-in-out"
            >
              <Flower className="w-6 h-6" />
              ClareAi
            </Link>
            <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">
              Transform your data into actionable insights with AI-powered
              analytics. Make better decisions, faster.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent)] transition-all duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h3 className="font-head font-semibold text-[var(--color-foreground)]">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#docs"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-up"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          {/* <div className="space-y-4">
            <h3 className="font-head font-semibold text-[var(--color-foreground)]">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300 text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Newsletter signup */}
          <div className="space-y-4">
            <h3 className="font-head font-semibold text-[var(--color-foreground)]">
              Stay Updated
            </h3>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              Get the latest insights and updates delivered to your inbox.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-l-full focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent"
                />
                <button className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-r-full hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] hover:text-white">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-[var(--color-muted-foreground)] text-sm">
              <span>© {currentYear} ClareAi. All rights reserved.</span>
              {/* <span>•</span>
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for data enthusiasts</span> */}
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
