import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
};

export function SectionHeading({ title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex flex-col gap-1">
        <h2 className="w-fit border-b-2 border-foreground/20 pb-1 font-heading text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-base font-semibold underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
