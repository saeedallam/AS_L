import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type Tab = "pencil" | "margin" | "link" | "ink";

/** Colour of the index tab along the top edge, as on a binder divider. */
const tabColour: Record<Tab, string> = {
  pencil: "bg-pencil",
  margin: "bg-margin",
  link: "bg-link",
  ink: "bg-ink",
};

type Props = {
  name: string;
  description: string;
  items: string[];
  href: string;
  tab: Tab;
  icon: LucideIcon;
};

export function CategoryCard({
  name,
  description,
  items,
  href,
  tab,
  icon: Icon,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-44 flex-col gap-2 border border-rule bg-tile p-5 pt-6 transition-colors hover:border-ink/40"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 transition-[height] group-hover:h-2.5",
          tabColour[tab],
        )}
      />
      <Icon aria-hidden className="size-6 text-ink" strokeWidth={1.75} />
      <span className="font-display text-lg font-bold leading-snug">
        {name}
      </span>
      <span className="text-sm leading-relaxed text-quiet">{description}</span>
      <ul className="mt-auto border-t border-rule pt-2 text-sm text-quiet">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Link>
  );
}
