import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

type Props = {
  name: string;
  href: string;
  category: string;
  /** Second line under the category, e.g. brand and variant count. */
  meta?: string | null;
  description?: string | null;
  /** Already formatted for display. Hidden when not provided. */
  price?: string | null;
  imageUrl?: string | null;
  whatsappUrl?: string | null;
  labels: { details: string; noImage: string; ask: string };
};

export function ProductCard({
  name,
  href,
  category,
  meta,
  description,
  price,
  imageUrl,
  whatsappUrl,
  labels,
}: Props) {
  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface transition hover:shadow-xl">
      <div>
        <div className="relative h-56 overflow-hidden bg-background sm:h-64">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder label={labels.noImage} />
          )}
          <span className="absolute end-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow">
            {category}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {meta ? (
            <p className="mb-1 text-xs font-medium text-subtle">{meta}</p>
          ) : null}
          <h3 className="mb-2 text-lg font-bold text-heading sm:text-xl">
            {/* Stretched link: the whole card opens the product. */}
            <Link href={href} className="after:absolute after:inset-0">
              {name}
            </Link>
          </h3>
          {description ? (
            <p className="line-clamp-2 text-xs text-subtle">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/60 p-5 pt-4 sm:p-6 sm:pt-4">
        {price ? (
          <span className="text-lg font-black text-heading">{price}</span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex min-h-11 items-center rounded-xl border border-line bg-background px-3.5 text-xs font-bold text-heading transition group-hover:bg-line/60"
          >
            {labels.details}
          </span>
          {whatsappUrl ? (
            // Sits above the stretched link so it stays clickable.
            <WhatsAppButton
              href={whatsappUrl}
              label={labels.ask}
              className="relative z-10 min-h-11 rounded-xl px-3.5 text-xs"
              iconClassName="size-4"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
