import { ImageFrame } from "@/components/shared/image-frame";
import { Link } from "@/i18n/navigation";
import { type IndexColour, indexStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  href: string;
  category: string;
  accent: IndexColour;
  price?: string | null;
  imageUrl?: string | null;
  placeholder: string;
  /** Taller frame, to vary the rhythm of a gallery row. */
  tall?: boolean;
  priority?: boolean;
  className?: string;
};

/** Image first, text under it. No border, no shadow, no box. */
export function ProductFigure({
  name,
  href,
  category,
  accent,
  price,
  imageUrl,
  placeholder,
  tall = false,
  priority,
  className,
}: Props) {
  return (
    <figure className={cn("group relative flex flex-col", className)}>
      <ImageFrame
        src={imageUrl}
        alt={name}
        placeholder={placeholder}
        priority={priority}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className={tall ? "aspect-[3/4]" : "aspect-square"}
      />
      <figcaption className="pt-3">
        <span
          className="text-xs font-semibold"
          style={{ ...indexStyle(accent), color: "var(--idx)" }}
        >
          {category}
        </span>
        <h3 className="mt-1 text-base font-semibold leading-snug">
          <Link href={href} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>
        {price ? (
          <p className="mt-1 text-sm text-graphite">{price}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
