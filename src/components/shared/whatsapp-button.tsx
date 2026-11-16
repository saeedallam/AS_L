import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./whatsapp-icon";

type Props = {
  href: string;
  label: string;
  /** Hide the text and show the icon alone (used on compact cards). */
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
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-whatsapp font-bold text-white transition hover:bg-whatsapp-hover",
        className,
      )}
    >
      <WhatsAppIcon className={cn("size-5", iconClassName)} />
      {iconOnly ? null : <span>{label}</span>}
    </a>
  );
}
