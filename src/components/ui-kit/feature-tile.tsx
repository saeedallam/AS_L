import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tints = {
  blue: "bg-navy-soft text-navy",
  gold: "bg-[#fef4dc] text-[#9a6b00] dark:bg-[#3a2f12] dark:text-gold",
  navy: "bg-navy text-white",
} as const;

type Props = {
  label: string;
  icon: LucideIcon;
  tint?: keyof typeof tints;
};

/** Icon in a tinted rounded square with its label underneath. */
export function FeatureTile({ label, icon: Icon, tint = "blue" }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        aria-hidden
        className={cn("grid size-14 place-items-center rounded-xl", tints[tint])}
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-bold text-navy">{label}</span>
    </div>
  );
}
