import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type Spec = { label: string; value: string };

type Props = {
  name: string;
  href: string;
  category: string;
  /** Measurements and counts, set as a table because that is what they are. */
  specs?: Spec[];
  price?: string | null;
  imageUrl?: string | null;
  whatsappUrl?: string | null;
  /** Tall for upright goods (bags), wide for flat ones (paper, colour sets). */
  shape?: "tall" | "wide" | "square";
  labels: { ask: string; noImage: string };
  className?: string;
};

const frame = {
  tall: "aspect-[3/4]",
  wide: "aspect-[16/10]",
  square: "aspect-square",
} as const;

export function ProductTile({
  name,
  href,
  category,
  specs,
  price,
  imageUrl,
  whatsappUrl,
  shape = "square",
  labels,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "group relative flex break-inside-avoid flex-col border border-rule bg-tile transition-colors hover:border-ink/40",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", frame[shape])}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder label={labels.noImage} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-rule p-4">
        <p className="text-xs font-semibold text-quiet">{category}</p>
        <h3 className="font-display text-base font-bold leading-snug">
          <Link href={href} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>

        {specs?.length ? (
          <dl className="mt-1 divide-y divide-rule border-y border-rule text-sm">
            {specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-3 py-1">
                <dt className="text-quiet">{spec.label}</dt>
                <dd className="font-semibold">{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {price ? (
            <span className="font-display text-base font-bold">{price}</span>
          ) : (
            <span />
          )}
          {whatsappUrl ? (
            <WhatsAppButton
              href={whatsappUrl}
              label={labels.ask}
              className="relative z-10 min-h-11 px-3 text-sm"
              iconClassName="size-4"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
