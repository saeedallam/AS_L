import { SlidersHorizontal } from "lucide-react";

export type FilterOption = { value: string; label: string; count: number };

export type FilterGroup = {
  /** Query-string key, e.g. `cat`. */
  name: string;
  legend: string;
  options: FilterOption[];
  selected: string[];
};

type Props = {
  title: string;
  groups: FilterGroup[];
  query?: string;
  applyLabel: string;
  clearLabel: string;
  clearHref: string;
  isFiltered: boolean;
};

/**
 * A GET form, so filtering is a normal navigation: shareable URLs, working
 * back button, and no JavaScript needed. Omitting `page` resets paging.
 */
export function FilterPanel({
  title,
  groups,
  query,
  applyLabel,
  clearLabel,
  clearHref,
  isFiltered,
}: Props) {
  return (
    <form className="rounded-xl border border-line bg-surface p-5 shadow-card">
      {query ? <input type="hidden" name="q" value={query} /> : null}

      <div className="flex items-center gap-2 border-b border-line pb-4">
        <SlidersHorizontal
          aria-hidden
          className="size-4 text-blue"
          strokeWidth={2.2}
        />
        <h2 className="text-base font-extrabold text-navy">{title}</h2>
      </div>

      {/* Capped on small screens so the products stay within reach. */}
      <div className="max-h-80 divide-y divide-line overflow-y-auto overscroll-contain lg:max-h-none lg:overflow-visible">
        {groups.map((group) => (
          <fieldset key={group.name} className="py-5">
            <legend className="mb-3 text-sm font-bold text-navy">
              {group.legend}
            </legend>
            <ul className="space-y-1">
              {group.options.map((option) => {
                const id = `${group.name}-${option.value}`;
                return (
                  <li key={option.value}>
                    <label
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink transition-colors hover:bg-navy-soft/60 has-[:checked]:font-bold has-[:checked]:text-navy"
                    >
                      <input
                        id={id}
                        type="checkbox"
                        name={group.name}
                        value={option.value}
                        defaultChecked={group.selected.includes(option.value)}
                        className="size-4 shrink-0 accent-[var(--navy)]"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      <span className="shrink-0 text-xs text-muted-text tabular-nums">
                        {option.count}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4 lg:border-t-0">
        <button
          type="submit"
          className="h-11 rounded-lg bg-navy text-sm font-bold text-white transition-colors hover:bg-navy-deep dark:text-navy-deep dark:hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {applyLabel}
        </button>
        {isFiltered ? (
          <a
            href={clearHref}
            className="grid h-11 place-items-center rounded-lg border border-line text-sm font-bold text-navy transition-colors hover:bg-navy-soft/60"
          >
            {clearLabel}
          </a>
        ) : null}
      </div>
    </form>
  );
}
