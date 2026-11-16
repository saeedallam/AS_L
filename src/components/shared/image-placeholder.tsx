import { cn } from "@/lib/utils";

/** Where a photo will go. Drawn as a cropping frame, not a grey box. */
export function ImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative grid size-full place-items-center bg-paper p-4 text-center text-xs text-quiet",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-3 border border-dashed border-ink/25"
      />
      <span className="relative">{label}</span>
    </div>
  );
}
