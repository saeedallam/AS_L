import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shown wherever a real photo has not been uploaded yet. */
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
        "flex size-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line bg-background text-xs text-muted",
        className,
      )}
    >
      <ImageIcon aria-hidden className="size-6" />
      {label}
    </div>
  );
}
