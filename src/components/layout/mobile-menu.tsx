"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  items: { href: string; label: string }[];
  labels: { open: string; close: string; nav: string };
};

export function MobileMenu({ items, labels }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-xl border border-line text-heading transition hover:bg-background"
      >
        {open ? (
          <X aria-hidden className="size-5" />
        ) : (
          <Menu aria-hidden className="size-5" />
        )}
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label={labels.nav}
          className="absolute inset-x-0 top-full border-b border-line bg-surface px-4 pb-4 shadow-lg"
        >
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-13 items-center border-b border-line text-sm font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
