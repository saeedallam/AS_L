import { Link } from "@/i18n/navigation";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

type Props = {
  name: string;
  href: string;
  category?: string | null;
  price?: string | null;
  noImageLabel: string;
};

/** Compact row card used in collections and "goes well with" lists. */
export function MiniProductCard({
  name,
  href,
  category,
  price,
  noImageLabel,
}: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:shadow-lg"
    >
      <span className="size-16 shrink-0 overflow-hidden rounded-xl">
        <ImagePlaceholder label={noImageLabel} className="text-[10px]" />
      </span>
      <span className="min-w-0 flex-1">
        {category ? (
          <span className="block text-[10px] text-muted">{category}</span>
        ) : null}
        <span className="block text-xs font-bold text-heading">{name}</span>
        {price ? (
          <span className="block text-xs font-black text-secondary">
            {price}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
