import { cssColor, DitherShader } from "@/lib/dither";
import type { DitherShaderProps } from "@/lib/dither";

/*
 * A planet's night side seen from orbit: a lit rim along a curved horizon,
 * aurora curtains rising off it and fixed stars above. The curtains follow
 * the curve because they are measured along and above the planet's surface.
 * Everything fades around `box`, the text block, so the headline sits on
 * clear sky.
 */
const FIELD = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

  // The planet: a circle sized to the width, its top at skyHorizon.
  float radius = max(0.65, 1.1 * aspect);
  vec2 centre = vec2(0.0, skyHorizon - radius);
  vec2 fromCentre = p - centre;
  float e = length(fromCentre) - radius;
  float above = max(e, 0.0);
  float below = max(-e, 0.0);
  // Distance along the rim, so curtains bend with the planet.
  float x = atan(fromCentre.x, fromCentre.y) * radius * 1.4 + t * 0.018;

  float light = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float base = 0.035 + fi * 0.05
      + 0.03 * snoise(vec2(x * 0.6 + fi * 3.1, t * 0.04 + fi * 1.7))
      + 0.012 * snoise(vec2(x * 2.4 - fi * 1.3, t * 0.08 + fi));
    float h = above - base;
    float curtain = h > 0.0 ? exp(-h * (8.0 + fi * 4.0)) : exp(h * 45.0);
    float bend = 0.45 * snoise(vec2(x * 0.7, t * 0.03 + fi));
    float rays = mix(0.2, 1.0, smoothstep(0.25, 0.75, fbm(vec2((x + bend) * 6.5 + fi * 9.0, t * 0.05 + fi))));
    float patch = mix(0.2, 1.0, smoothstep(0.2, 0.7, fbm(vec2(x * 0.45 + fi * 5.0, t * 0.02 + fi * 2.0))));
    float edge = exp(-abs(h) * 32.0);
    light += (curtain * rays + 0.55 * edge * rays) * patch * mix(1.0, 0.5, fi * 0.5);
  }
  // Curtains die out well below the headline.
  float aurora = (1.0 - exp(-light * 1.1)) * skyIntensity * smoothstep(0.4, 0.12, above);
  float glow = 0.9 * exp(-above * 22.0);
  float sky = max(aurora, glow);

  // The lit rim, then the dark planet with a faint band of night under it.
  float rim = exp(-below * 90.0);
  float night = 0.07 * exp(-below * 9.0) * (0.6 + 0.4 * fbm(vec2(x * 3.0, below * 20.0)));
  float tone = e > 0.0 ? sky : max(rim, night);

  // Fixed stars, thinning out towards the glow.
  vec2 cell = floor(uv * res);
  float seed = hash21(vec2(hash21(cell), hash21(cell.yx + 31.7)) * 97.0);
  float star = step(0.9985, seed) * smoothstep(0.1, 0.35, above) * mix(0.55, 1.0, hash21(cell + 7.0));
  tone = max(tone, star);

  // Clear a rounded box around the text, measured in cells.
  vec2 d = abs((uv - skyBox.xy) * res) - skyBox.zw * res + 30.0;
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 30.0;
  return tone * smoothstep(-10.0, 40.0, dist);
}
`;

export type AuroraHorizonProps = Omit<
  DitherShaderProps,
  "field" | "uniforms" | "fallback" | "palette"
> & {
  /** The text block to keep clear: centre (uv, y up) and half size, 0 to 1. */
  box?: readonly [number, number, number, number];
  /** Height of the horizon's top from the bottom, 0 to 1. Default 0.24. */
  horizon?: number;
  /** Peak brightness of the curtains, 0 to 1. Default 0.85. */
  intensity?: number;
};

// Paper, then faint purple tips, green curtains, and the bright rim.
const PALETTE = [
  "--dither-paper",
  "--sky-tip",
  "--dither-ink",
  "color-mix(in oklch, var(--dither-ink) 55%, var(--foreground))",
] as const;

export const AuroraHorizon = ({
  box = [0.5, 0.5, 0, 0],
  horizon = 0.2,
  intensity = 0.75,
  stillTime = 18,
  ...props
}: AuroraHorizonProps) => (
  <DitherShader
    {...props}
    field={FIELD}
    palette={PALETTE}
    matrix="bayer8"
    levels={13}
    fps={24}
    stillTime={stillTime}
    uniforms={{
      skyBox: box,
      skyHorizon: horizon,
      skyIntensity: intensity,
    }}
    fallback={
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: cssColor("--dither-paper"),
          backgroundImage: [
            `radial-gradient(ellipse 120% 60% at 50% calc(${(1 - horizon) * 100}% + 60%), ${cssColor("--dither-paper")} 99%, transparent 100%)`,
            `radial-gradient(ellipse 90% 40% at 50% ${(1 - horizon) * 100}%, color-mix(in oklch, ${cssColor("--dither-ink")} 40%, transparent), transparent 70%)`,
          ].join(", "),
        }}
      />
    }
  />
);
