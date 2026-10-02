"use client";

import { useState, type RefObject } from "react";
import { toPng } from "html-to-image";
import { Check, ImageDown, Loader2 } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";

interface Props {
  /** The DOM node to rasterize (the verdict card wrapper). */
  targetRef: RefObject<HTMLDivElement | null>;
  fileName?: string;
}

/**
 * Exports the verdict card as a PNG — shares it as a file where the platform
 * supports it (mobile), otherwise downloads. This is the "screenshot & post it"
 * moment, minus the screenshotting.
 */
export function SaveImageButton({ targetRef, fileName = "draft-arena-verdict.png" }: Props) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function save() {
    const node = targetRef.current;
    if (!node || state === "working") return;
    setState("working");
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });

      // Prefer native file share (mobile) — falls back to a plain download.
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Draft Arena verdict" });
          setState("done");
          setTimeout(() => setState("idle"), 1800);
          return;
        }
      } catch {
        // share dismissed/unsupported — fall through to download
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.click();
      setState("done");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <HardButton type="button" intent="dark" onClick={save} disabled={state === "working"}>
      {state === "working" ? (
        <Loader2 className="animate-spin" />
      ) : state === "done" ? (
        <Check />
      ) : (
        <ImageDown />
      )}
      {state === "working" ? "Rendering…" : state === "done" ? "Saved" : state === "error" ? "Failed — retry" : "Save as image"}
    </HardButton>
  );
}
