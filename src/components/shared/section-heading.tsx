import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

/**
 * A section opener. The red tick on the margin rule marks where the
 * section starts, the way a heading is marked in a ruled notebook.
 */
export function SectionHeading({ title, description, action }: Props) {
  return (
    <div className="rule-tick relative mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-rule pb-3">
      <div>
        <h2 className="text-balance font-display text-2xl font-bold leading-tight sm:text-[1.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-prose text-[15px] text-quiet">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="pb-1 text-[15px] font-semibold text-link underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
