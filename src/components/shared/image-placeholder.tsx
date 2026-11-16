import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shown wherever a product, category or gallery image has not been uploaded yet. */
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
        "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/25 bg-background text-sm text-muted",
        className,
      )}
    >
      <ImageIcon aria-hidden className="size-6" />
      {label}
    </div>
  );
}
