import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

type Props = {
  name: string;
  href: string;
  category: string;
  brand?: string | null;
  /** Already formatted, e.g. "45 EGP". Hidden when not provided. */
  price?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  badge?: string | null;
  labels: { details: string; noImage: string };
};

export function ProductCard({
  name,
  href,
  category,
  brand,
  price,
  imageUrl,
  imageAlt,
  badge,
  labels,
}: Props) {
  return (
    <article className="group relative flex flex-col gap-2.5 rounded-2xl border border-foreground/10 bg-surface p-3.5 transition-transform hover:-translate-y-1">
      <div className="relative">
        {imageUrl ? (
          <div className="relative aspect-square overflow-hidden rounded-xl bg-background">
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : (
          <ImagePlaceholder label={labels.noImage} />
        )}
        {badge ? (
          <span className="absolute start-2.5 top-2.5 -rotate-2 rounded-md bg-eraser px-2.5 py-0.5 text-[13px] font-semibold text-ink">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="text-[13px] font-semibold text-muted">
        {brand ? `${category} · ${brand}` : category}
      </p>

      <h3 className="font-heading text-lg font-semibold leading-snug">
        {/* The stretched link makes the whole card clickable. */}
        <Link href={href} className="after:absolute after:inset-0">
          {name}
        </Link>
      </h3>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {price ? <span className="font-bold">{price}</span> : <span />}
        <span
          aria-hidden
          className="inline-flex min-h-11 items-center rounded-full border border-foreground/40 px-4 text-[15px] font-semibold transition-colors group-hover:bg-foreground/5"
        >
          {labels.details}
        </span>
      </div>
    </article>
  );
}
