import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { type IndexColour, indexStyle } from "@/lib/categories";

type Props = {
  name: string;
  description: string;
  href: string;
  accent: IndexColour;
  /** A few things the section actually holds, as words rather than boxes. */
  samples: string[];
};

/** A row in the index, not a card. The colour edge is the category's mark. */
export function CategoryRow({
  name,
  description,
  href,
  accent,
  samples,
}: Props) {
  return (
    <Link
      href={href}
      style={indexStyle(accent)}
      className="idx-edge group grid items-baseline gap-x-10 gap-y-2 border-b border-line py-5 ps-5 pe-4 transition-colors hover:bg-secondary/50 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto]"
    >
      <span
        className="text-xl font-bold leading-tight"
        style={{ color: "var(--idx)" }}
      >
        {name}
      </span>

      <span className="text-[15px] text-graphite">
        {description}
        <span className="mt-1 block text-sm text-graphite/80 lg:mt-0.5">
          {samples.join(" · ")}
        </span>
      </span>

      <ChevronLeft
        aria-hidden
        className="hidden size-5 self-center text-graphite transition-transform group-hover:-translate-x-1 ltr:rotate-180 lg:block"
        strokeWidth={1.75}
      />
    </Link>
  );
}
