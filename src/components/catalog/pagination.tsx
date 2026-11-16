import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageCount: number;
  /** Builds the href for a page while keeping the current filters. */
  hrefFor: (page: number) => string;
  labels: { nav: string; previous: string; next: string; page: string };
};

const cell =
  "grid size-10 place-items-center rounded-lg border border-line bg-surface text-sm font-bold text-navy transition-colors hover:bg-navy-soft/60";

export function Pagination({ page, pageCount, hrefFor, labels }: Props) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label={labels.nav} className="mt-10 flex justify-center">
      <ul className="flex items-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              aria-label={labels.previous}
              className={cell}
            >
              <ChevronRight
                aria-hidden
                className="size-4 ltr:rotate-180"
                strokeWidth={2}
              />
            </Link>
          ) : (
            <span aria-hidden className={cn(cell, "opacity-40")}>
              <ChevronRight className="size-4 ltr:rotate-180" strokeWidth={2} />
            </span>
          )}
        </li>

        {pages.map((value) => (
          <li key={value}>
            <Link
              href={hrefFor(value)}
              aria-label={`${labels.page} ${value}`}
              aria-current={value === page ? "page" : undefined}
              className={cn(
                cell,
                value === page &&
                  "border-navy bg-navy text-white hover:bg-navy-deep dark:text-navy-deep dark:hover:brightness-110",
              )}
            >
              {value}
            </Link>
          </li>
        ))}

        <li>
          {page < pageCount ? (
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              aria-label={labels.next}
              className={cell}
            >
              <ChevronLeft
                aria-hidden
                className="size-4 ltr:rotate-180"
                strokeWidth={2}
              />
            </Link>
          ) : (
            <span aria-hidden className={cn(cell, "opacity-40")}>
              <ChevronLeft className="size-4 ltr:rotate-180" strokeWidth={2} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
