import Image from "next/image";
import { PenTool } from "lucide-react";
import { type MediaKey, photoSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  media: MediaKey;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Text shown on the placeholder so the slot is self-explanatory. */
  slotLabel?: string;
};

/**
 * A product photo. Falls back to a tinted placeholder with the shop's
 * mark, so an empty catalogue still reads as a finished layout.
 */
export function Photo({
  media,
  alt,
  sizes,
  priority,
  className,
  slotLabel,
}: Props) {
  const src = photoSrc(media);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          role="img"
          aria-label={slotLabel ?? alt}
          className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--navy-soft),var(--secondary))] p-4"
        >
          <span className="flex flex-col items-center gap-2 text-center">
            <PenTool
              aria-hidden
              className="size-7 text-navy/35"
              strokeWidth={1.5}
            />
            {slotLabel ? (
              <span className="text-[11px] font-medium leading-tight text-navy/50">
                {slotLabel}
              </span>
            ) : null}
          </span>
        </div>
      )}
    </div>
  );
}
