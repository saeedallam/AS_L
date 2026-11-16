import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  label,
}: {
  items: Crumb[];
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-text">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {item.href ? (
              <Link href={item.href} className="hover:text-blue">
                {item.label}
              </Link>
            ) : (
              <span className="font-bold text-navy">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <ChevronLeft
                aria-hidden
                className="size-3.5 ltr:rotate-180"
                strokeWidth={2}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
