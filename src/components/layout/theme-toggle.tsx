"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-11 place-items-center rounded-md border border-line transition-colors hover:border-ink/40"
    >
      <Moon aria-hidden className="size-4 dark:hidden" strokeWidth={1.75} />
      <Sun aria-hidden className="hidden size-4 dark:block" strokeWidth={1.75} />
    </button>
  );
}
