import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type Accent = "pencil" | "ruler" | "eraser" | "marker";

const accentStyles: Record<Accent, { card: string; icon: string }> = {
  pencil: { card: "bg-pencil-soft", icon: "bg-pencil" },
  ruler: { card: "bg-ruler-soft", icon: "bg-ruler" },
  eraser: { card: "bg-eraser-soft", icon: "bg-eraser" },
  marker: { card: "bg-marker-soft", icon: "bg-marker/60" },
};

type Props = {
  name: string;
  description: string;
  href: string;
  accent: Accent;
  icon: LucideIcon;
};

export function CategoryCard({
  name,
  description,
  href,
  accent,
  icon: Icon,
}: Props) {
  const styles = accentStyles[accent];

  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-48 flex-col gap-3 rounded-2xl border border-ink/10 p-6 text-ink transition-transform hover:-translate-y-1",
        styles.card,
      )}
    >
      <span
        aria-hidden
        className={cn("grid size-13 place-items-center rounded-xl", styles.icon)}
      >
        <Icon className="size-6" />
      </span>
      <span className="font-heading text-xl font-semibold">{name}</span>
      <span className="text-[15px] text-ink/75">{description}</span>
    </Link>
  );
}
