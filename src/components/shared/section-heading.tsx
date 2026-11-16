import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

/** A rule, the heading, and an optional link. No pill above it. */
export function SectionHeading({ title, description, action }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-3 border-t border-ink pt-5">
      <div className="max-w-2xl">
        <h2 className="text-[1.75rem] font-bold leading-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-[15px] text-graphite">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="pb-1 font-semibold text-brand underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
