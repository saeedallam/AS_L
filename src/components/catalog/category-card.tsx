import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  browseLabel: string;
};

export async function CategoryCard({
  name,
  description,
  href,
  icon: Icon,
  browseLabel,
}: Props) {
  const locale = await getLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={href}
      className="group rounded-3xl border border-line bg-surface p-6 text-center shadow-sm transition hover:border-brand hover:shadow-xl"
    >
      <span
        aria-hidden
        className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand transition duration-300 group-hover:bg-primary group-hover:text-gold"
      >
        <Icon className="size-7" />
      </span>
      <span className="block text-lg font-bold text-heading">{name}</span>
      <span className="mt-1 block text-xs text-subtle">{description}</span>
      <span className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-brand">
        {browseLabel}
        <Arrow aria-hidden className="size-3.5" />
      </span>
    </Link>
  );
}
