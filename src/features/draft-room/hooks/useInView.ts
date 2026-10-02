"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether an element is at least partly visible below the fixed header.
 * Returns a callback ref (so it re-attaches when the element remounts, e.g.
 * after a redraft) and the visibility flag. Defaults to true so nothing flashes
 * in before the first observation.
 */
export function useInView<T extends HTMLElement>(topOffsetPx = 64): [(node: T | null) => void, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!node) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // Shrink the viewport top by the header height: "visible" = visible under it.
      { rootMargin: `-${topOffsetPx}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, topOffsetPx]);

  return [setNode, inView];
}
