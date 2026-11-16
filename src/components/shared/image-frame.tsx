import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  /** Shown until a real photo is uploaded. */
  placeholder: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Square-cornered product frame. The placeholder is designed, not a grey
 * box, so an empty catalogue still looks deliberate.
 */
export function ImageFrame({
  src,
  alt,
  placeholder,
  sizes,
  priority,
  className,
}: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div
          role="img"
          aria-label={placeholder}
          className="grid size-full place-items-center p-6 text-center"
        >
          <span className="text-xs font-medium text-graphite">
            {placeholder}
          </span>
        </div>
      )}
    </div>
  );
}
