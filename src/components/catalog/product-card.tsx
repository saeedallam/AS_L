import { Photo } from "@/components/shared/photo";
import { ActionAnchor, ActionLink } from "@/components/ui-kit/button";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Link } from "@/i18n/navigation";
import type { MediaKey } from "@/lib/media";

type Props = {
  name: string;
  /** Brand, pack size or anything the shop wants under the name. */
  meta?: string | null;
  price?: string | null;
  href: string;
  media: MediaKey;
  slotLabel: string;
  askUrl?: string | null;
  askLabel: string;
};

/** White card: photo, name, then a full-width enquiry button. */
export function ProductCard({
  name,
  meta,
  price,
  href,
  media,
  slotLabel,
  askUrl,
  askLabel,
}: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow hover:shadow-raised">
      <Photo
        media={media}
        alt={name}
        slotLabel={slotLabel}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-square"
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-[15px] font-bold leading-snug text-navy">
          <Link href={href} className="hover:text-blue">
            {name}
          </Link>
        </h3>
        {meta ? <p className="text-xs text-muted-text">{meta}</p> : null}
        {price ? (
          <p className="text-sm font-bold text-navy">{price}</p>
        ) : null}

        <div className="mt-3">
          {askUrl ? (
            <ActionAnchor
              href={askUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <WhatsAppIcon className="size-4" />
              {askLabel}
            </ActionAnchor>
          ) : (
            <ActionLink href={href} className="w-full">
              {askLabel}
            </ActionLink>
          )}
        </div>
      </div>
    </article>
  );
}
