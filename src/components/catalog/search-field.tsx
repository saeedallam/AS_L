import { Search } from "lucide-react";

type Props = {
  defaultValue?: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  /** Carried through the GET submit so filters survive a new search. */
  hidden?: { name: string; value: string }[];
};

/** A plain GET form: search works with JavaScript disabled. */
export function SearchField({
  defaultValue,
  label,
  placeholder,
  submitLabel,
  hidden = [],
}: Props) {
  return (
    <form role="search" className="relative">
      {hidden.map((field, index) => (
        <input
          key={`${field.name}-${index}`}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}

      <label htmlFor="catalog-search" className="sr-only">
        {label}
      </label>
      <input
        id="catalog-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className="h-14 w-full rounded-xl border border-line bg-surface pe-5 ps-14 text-[15px] text-ink shadow-card outline-none placeholder:text-muted-text focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/30"
      />
      <button
        type="submit"
        aria-label={submitLabel}
        className="absolute start-2 top-2 grid size-10 place-items-center rounded-lg text-muted-text transition-colors hover:bg-navy-soft hover:text-navy focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none"
      >
        <Search aria-hidden className="size-5" strokeWidth={2} />
      </button>
    </form>
  );
}
