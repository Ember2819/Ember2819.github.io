import { useEffect, useRef } from "react";

import { ditherImage, useDitherColors } from "@/lib/dither";
import { cn } from "@/lib/utils";

/** Draws `src` at one pixel per cell, dithered to the theme's paper and ink. */
export const DitheredPhoto = ({
  src,
  alt,
  cell = 3,
  className,
}: {
  src: string;
  alt: string;
  cell?: number;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useDitherColors(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context || !colors) return;
    const [ink, paper] = colors;
    const image = new Image();
    image.onload = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth / cell));
      const height = Math.round((width * image.height) / image.width);
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      const dithered = ditherImage(context.getImageData(0, 0, width, height), {
        method: "atkinson",
        palette: [paper, ink],
      });
      context.putImageData(dithered, 0, 0);
    };
    image.src = src;
  }, [src, cell, colors]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={cn("aspect-square w-full [image-rendering:pixelated]", className)}
    />
  );
};
