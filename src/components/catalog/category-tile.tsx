import { Photo } from "@/components/shared/photo";
import { Link } from "@/i18n/navigation";
import type { MediaKey } from "@/lib/media";

type Props = {
  name: string;
  href: string;
  media: MediaKey;
  slotLabel: string;
};

/** A category as a photo with its name banded across the bottom. */
export function CategoryTile({ name, href, media, slotLabel }: Props) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl shadow-card transition-shadow hover:shadow-raised"
    >
      <Photo
        media={media}
        alt={name}
        slotLabel={slotLabel}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3]"
      />
      <span
        aria-hidden
        className="photo-veil pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
      />
      <span className="absolute inset-x-0 bottom-0 p-4 text-base font-bold text-white">
        {name}
      </span>
    </Link>
  );
}
