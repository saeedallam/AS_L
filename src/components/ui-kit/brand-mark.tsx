import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The official mark of مكتبة أسماء النموذجية (Asmaa Model Library),
 * extracted directly from the uploaded official brand logo.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow-xs",
        className,
      )}
    >
      <Image
        src="/media/logo-mark.png"
        alt=""
        fill
        sizes="48px"
        className="object-contain p-1"
      />
    </span>
  );
}
