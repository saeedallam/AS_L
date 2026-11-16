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
        className="grid size-11 place-items-center rounded-md border border-line transition-colors hover:border-ink/40"
      >
        {open ? (
          <X aria-hidden className="size-5" strokeWidth={1.75} />
        ) : (
          <Menu aria-hidden className="size-5" strokeWidth={1.75} />
        )}
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label={labels.nav}
          className="absolute inset-x-0 top-full border-b border-line bg-paper px-5 pb-3 shadow-menu"
        >
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-13 items-center border-b border-line text-[15px] font-medium"
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
