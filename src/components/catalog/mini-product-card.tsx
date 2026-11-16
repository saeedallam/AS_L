import { Link } from "@/i18n/navigation";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

type Props = {
  name: string;
  href: string;
  brand?: string | null;
  price?: string | null;
  noImageLabel: string;
};

/** Compact card used inside collection rows and "goes well with" lists. */
export function MiniProductCard({
  name,
  href,
  brand,
  price,
  noImageLabel,
}: Props) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1.5 rounded-2xl border border-foreground/10 bg-surface p-2.5 transition-transform hover:-translate-y-1"
    >
      <ImagePlaceholder label={noImageLabel} className="text-[13px]" />
      {brand ? (
        <span className="text-xs font-semibold text-muted">{brand}</span>
      ) : null}
      <span className="font-heading text-[15px] font-semibold leading-snug">
        {name}
      </span>
      {price ? <span className="text-sm font-bold">{price}</span> : null}
    </Link>
  );
}
