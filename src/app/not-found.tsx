import Link from "next/link";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-md py-xl text-center">
      <JerseyBadge tone="live">Offside</JerseyBadge>
      <h1 className="font-display-xl text-display-xl font-black uppercase italic leading-none text-on-surface">
        404
      </h1>
      <p className="font-sans text-body-md text-on-surface-variant">
        This page is off the pitch. The draft may have ended, been cancelled by the host, or the
        link is simply wrong.
      </p>
      <div className="flex justify-center gap-sm">
        <HardButton asChild intent="primary">
          <Link href="/">Back home</Link>
        </HardButton>
        <HardButton asChild intent="accent">
          <Link href="/draft/new">Start a draft</Link>
        </HardButton>
      </div>
    </div>
  );
}
