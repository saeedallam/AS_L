import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  /** Small pill above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  align?: "start" | "center";
};

export async function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
}: Props) {
  const locale = await getLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  if (align === "center") {
    return (
      <div className="mx-auto mb-12 max-w-2xl text-center">
        {eyebrow ? (
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-3 text-2xl font-black text-heading sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted">{description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
      )}
    >
      <div>
        {eyebrow ? (
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-3 text-2xl font-black text-heading sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 font-bold text-heading transition hover:text-secondary"
        >
          <span>{action.label}</span>
          <Arrow aria-hidden className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
