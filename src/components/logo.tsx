import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 rotate-45 place-items-center overflow-hidden rounded-[14px] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_8px_20px_-8px_rgba(169,129,47,0.8)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 -rotate-45 text-forest-950"
        fill="currentColor"
        aria-hidden
      >
        <path d="M4.5 18.6c3.2-1 6.8-2.2 9.4-4.2l-3.1-3.1c-1 2.4-3 4.9-6.3 7.3Z" opacity=".55" />
        <path d="M18.7 2.8c-3.6.4-8 2.6-9.6 6.2l3.7 3.7c3.9-.2 7.2-4.4 7.7-8l-1.8-1.9Z" />
        <path d="M10.2 13.8 14 17.6c1.6 1.7 4.9 1.5 6.6.4-1.1.6-3 .9-4.4.4 1.2-.5 2.3-1.4 3-2.4-2.3 0-4.6-.6-6.1-1.7-.9-.6-1.9-1.4-2.9-2.5l1.4 2c-1.1 1-2.7 1.9-4.4 2.5 2.9 0 5.6-.4 8-2-1.9-.3-3.6-.9-5-2Zm-1-3.9c.1 2 1 3.8 2.2 5.2" opacity=".55" />
        <circle cx="16.1" cy="5.6" r=".9" className="fill-forest-950" />
      </svg>
      <span className="pointer-events-none absolute -inset-1 -rotate-45 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-60" />
    </span>
  );
}

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-2xl font-bold tracking-tight",
            light ? "text-ivory-100" : "text-forest-950",
          )}
        >
          طوقی
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-medium tracking-[0.3em]",
            light ? "text-gold-300" : "text-gold-600",
          )}
        >
          TOUGHI
        </span>
      </span>
    </span>
  );
}
