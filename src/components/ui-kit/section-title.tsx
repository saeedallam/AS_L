import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
};

/** Centred navy heading with an optional muted line under it. */
export function SectionTitle({
  title,
  subtitle,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" ? "mx-auto max-w-2xl text-center" : "",
        className,
      )}
    >
      <h2 className="text-2xl font-extrabold text-navy sm:text-[1.75rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-sm text-muted-text">{subtitle}</p>
      ) : null}
    </div>
  );
}
