"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/app/providers/theme-provider";
import Link from "next/link";
import { IconInnerShadowTop } from "@tabler/icons-react";
export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="flex min-h-(--header-height) py-4 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) fixed top-0 z-30 bg-[var(--color-background)]/80 backdrop-blur w-full lg:w-[calc(100%-var(--header-offset))]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-medium flex items-center gap-2">
            <Link
              href="/dashboard"
              className="font-semibold flex gap-2 items-center"
            >
              <IconInnerShadowTop className="size-6" />
              ClareAi
            </Link>
          </h1>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold hidden lg:block">
            Toggle Sidebar: Ctrl+D
          </span>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
            >
              {theme === "dark" ? (
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
          </div>
        </div>
      </div>
    </header>
  );
}
