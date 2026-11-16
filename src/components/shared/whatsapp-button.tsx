import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./whatsapp-icon";

type Props = {
  href: string;
  label: string;
  /** Hide the text and show the icon alone. */
  iconOnly?: boolean;
  className?: string;
  iconClassName?: string;
};

export function WhatsAppButton({
  href,
  label,
  iconOnly = false,
  className,
  iconClassName,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={iconOnly ? label : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-whatsapp font-semibold text-white transition-colors hover:brightness-110",
        className,
      )}
    >
      <WhatsAppIcon className={cn("size-5", iconClassName)} />
      {iconOnly ? null : <span>{label}</span>}
    </a>
  );
}
