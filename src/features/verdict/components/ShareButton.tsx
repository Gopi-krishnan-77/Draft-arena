"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";

/** Shares the verdict via the Web Share API, falling back to clipboard. */
export function ShareButton({ headline, url }: { headline: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `“${headline}” — Draft Arena`;
    const shareData: ShareData = url ? { title: "Draft Arena", text, url } : { title: "Draft Arena", text };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user dismissed or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no-op */
    }
  }

  return (
    <HardButton type="button" intent="accent" onClick={share}>
      {copied ? <Check /> : <Share2 />}
      {copied ? "Copied" : "Share verdict"}
    </HardButton>
  );
}
