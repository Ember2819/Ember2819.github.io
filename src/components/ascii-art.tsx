import { useMemo, useRef } from "react";

import { sceneFor } from "@/components/ascii-scenes";
import { useFrameLoop } from "@/lib/dither";
import { cn } from "@/lib/utils";

/**
 * Plays a project's ASCII scene. Frames are written straight into the DOM,
 * so React never re-renders; the loop pauses offscreen and holds a still
 * frame under reduced motion.
 */
export const AsciiArt = ({
  repo,
  label,
  className,
}: {
  repo: string;
  label: string;
  className?: string;
}) => {
  const ref = useRef<HTMLPreElement>(null);
  const scene = useMemo(() => sceneFor(repo), [repo]);
  useFrameLoop(
    (time) => {
      if (ref.current) ref.current.innerHTML = scene(time + 4.2);
    },
    { target: ref, fps: 12, stillTime: 4.2 }
  );
  return (
    <pre
      ref={ref}
      role="img"
      aria-label={label}
      className={cn(
        "mx-auto w-fit font-mono text-[10px] leading-[1.25] text-muted-foreground select-none sm:text-[11.5px] lg:text-[13px] [&_b]:font-normal [&_b]:text-primary",
        className
      )}
    />
  );
};
