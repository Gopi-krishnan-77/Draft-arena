import { ArrowUpRight } from "lucide-react";

const AUTHOR_URL = "https://gopikrishnanb.co.in";

/** Site-wide footer: a maker credit styled as a clickable sticker card. */
export function SiteFooter() {
  return (
    // Bottom padding clears the fixed mobile BottomNav (h-20).
    <footer className="border-t-2 border-ink bg-on-background pb-28 pt-md md:pb-md">
      <div className="mx-auto flex max-w-7xl justify-center px-margin-mobile md:px-margin-desktop">
        <a
          href={AUTHOR_URL}
          target="_blank"
          rel="noopener"
          className="group flex w-full max-w-md items-center justify-between gap-sm rounded-xl border-2 border-surface bg-surface p-sm shadow-hard-primary transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
        >
          <span className="min-w-0">
            <span className="block font-label-bold text-label-bold uppercase text-on-surface-variant">
              Made by
            </span>
            <span className="block truncate font-display text-headline-md font-black uppercase italic text-on-surface">
              Gopikrishnan B
            </span>
            <span className="block font-sans text-xs text-on-surface-variant">
              See what else I&apos;m building →
            </span>
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-tertiary-fixed text-on-tertiary-fixed shadow-hard transition-transform group-hover:rotate-12">
            <ArrowUpRight className="size-6" />
          </span>
        </a>
      </div>
    </footer>
  );
}
