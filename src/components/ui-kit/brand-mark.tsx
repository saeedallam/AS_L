import { cn } from "@/lib/utils";

/** The shop's mark: a navy rounded square with a gold nib. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-navy",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M7 20c0-5 1.5-9.5 5-13 1.8-1.8 3.6-2.6 5-2.6.4 2.2-.4 4.6-2.4 7.2C11.8 15.3 9.6 18 7 20Z"
          fill="var(--gold)"
        />
        <path
          d="M7 20c1.6-1.1 3-2.6 4-4.3"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
