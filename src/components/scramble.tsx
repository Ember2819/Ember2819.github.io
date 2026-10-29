import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/dither";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@01";

/**
 * Text that resolves left to right out of random ASCII. The real text
 * holds the layout and is what screen readers get; the scramble is laid
 * over it.
 */
export const Scramble = ({ text, duration = 1100, delay = 150 }: { text: string; duration?: number; delay?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = text;
      return;
    }
    let frame = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const progress = Math.max(0, (now - start) / duration);
      el.textContent = [...text]
        .map((ch, i) => {
          if (ch === " ") return " ";
          const settle = (i + 1) / text.length;
          return progress >= settle ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, duration, delay, reduced]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="invisible">{text}</span>
      <span ref={ref} aria-hidden="true" className="absolute inset-0">
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
};
