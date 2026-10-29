/*
 * Small animated ASCII scenes, one per pinned project. Each scene is a pure
 * function from time (seconds) to an HTML string of `COLS` by `ROWS`
 * characters. Text inside <b> is drawn in the accent colour. Everything is
 * built from fixed strings here, so the HTML is safe to inject.
 */

export const COLS = 46;
export const ROWS = 17;

export type Scene = (t: number) => string;

const fract = (value: number) => value - Math.floor(value);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const pad = (text: string, width = COLS) =>
  text.length >= width ? text.slice(0, width) : text + " ".repeat(width - text.length);
const accent = (text: string) => `<b>${text}</b>`;

/** A grid of cells where each cell is a plain char or an accented one. */
const grid = () =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ ch: " ", hot: false }))
  );

const flatten = (cells: ReturnType<typeof grid>) =>
  cells
    .map((row) => {
      let line = "";
      let run = "";
      let hot = false;
      for (const cell of row) {
        if (cell.hot !== hot) {
          line += hot ? accent(run) : run;
          run = "";
          hot = cell.hot;
        }
        run += cell.ch;
      }
      return line + (hot ? accent(run) : run);
    })
    .join("\n");

/* BumbleBee: a radar sweep finds hosts, then some of them drop offline. */
const BLIPS = Array.from({ length: 9 }, (_, i) => ({
  angle: hash(i + 1) * Math.PI * 2,
  radius: 0.28 + hash(i + 11) * 0.62,
}));

const radar: Scene = (t) => {
  const cells = grid();
  const cx = Math.floor((COLS - 1) / 2);
  const cy = Math.floor((ROWS - 2) / 2);
  const R = cy;
  const sweep = fract(t * 0.16);
  const pass = Math.floor(t * 0.16);
  const trail = ["#", "*", "+", "=", ":", "-", "."];
  for (let y = 0; y < ROWS - 1; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const dx = (x - cx) / 2;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) / R;
      if (r > 1.04) continue;
      const cell = cells[y][x];
      const angle = fract(Math.atan2(dx, -dy) / (Math.PI * 2));
      const behind = fract(sweep - angle);
      if (behind < 0.14 && r < 1) {
        cell.ch = trail[Math.min(trail.length - 1, Math.floor((behind / 0.14) * trail.length))];
        cell.hot = behind < 0.03;
      } else if (Math.abs(r - 1) < 0.05 || Math.abs(r - 0.5) < 0.04) {
        cell.ch = "·";
      } else if ((Math.abs(dx) < 0.3 || Math.abs(dy) < 0.3) && r < 1) {
        cell.ch = "·";
      }
    }
  }
  let online = 0;
  BLIPS.forEach((blip, i) => {
    const x = Math.round(cx + Math.sin(blip.angle) * blip.radius * R * 2);
    const y = Math.round(cy - Math.cos(blip.angle) * blip.radius * R);
    const seen = fract(sweep - blip.angle / (Math.PI * 2));
    // Each blip goes offline on its own pass, then the scan starts over.
    const down = (pass % 5) > 1 && hash(i + pass * 3) > 0.45;
    if (!down) online += 1;
    if (seen < 0.6) {
      cells[y][x] = { ch: down ? "x" : "@", hot: !down };
    }
  });
  const status = pad(`  hosts ${BLIPS.length}   up ${online}   down ${BLIPS.length - online}`);
  cells[ROWS - 1] = [...status].map((ch) => ({ ch, hot: false }));
  return flatten(cells);
};

/* GeckoOS: a boot log typing itself out, then a prompt. */
const BOOT = [
  "GeckoOS",
  "",
  "[ ok ] bootloader",
  "[ ok ] kernel loaded",
  "[ ok ] memory map",
  "[ ok ] interrupts",
  "[ ok ] keyboard",
  "[ ok ] display",
  "",
  "gecko> hello",
  "hello from a tiny kernel",
  "gecko> ",
];

const boot: Scene = (t) => {
  const cycle = fract(t / 14) * 14;
  let budget = Math.floor(cycle * 22);
  const lines: string[] = [];
  for (const line of BOOT) {
    if (budget <= 0) break;
    const shown = line.slice(0, budget);
    budget -= Math.max(line.length, 6);
    lines.push(shown);
  }
  const cursor = Math.floor(t * 2) % 2 === 0 ? "█" : " ";
  const out = lines.map((line) => {
    const text = pad(` ${line}`);
    if (line.startsWith("[ ok ]")) return ` [ ${accent("ok")} ]${text.slice(7)}`;
    if (line === "GeckoOS") return accent(text);
    return text;
  });
  const last = out.length - 1;
  if (last >= 0) out[last] = out[last].replace(/ {2,}$/, (s) => cursor + s.slice(1));
  while (out.length < ROWS) out.push(pad(""));
  return out.slice(-ROWS).join("\n");
};

/* ollama-scout: a scan log, with open endpoints standing out. */
const HOSTS = Array.from({ length: 40 }, (_, i) => {
  const ip = `${["203.0.113", "198.51.100", "192.0.2"][i % 3]}.${Math.floor(hash(i + 3) * 254) + 1}`;
  const open = hash(i + 50) > 0.62;
  return { ip, open };
});

const scout: Scene = (t) => {
  const step = Math.floor(t * 2.4);
  const lines = [pad(` scanning port 11434`), pad("")];
  const visible = ROWS - 3;
  for (let i = 0; i < visible; i += 1) {
    const host = HOSTS[(step + i) % HOSTS.length];
    const ip = host.ip.padEnd(17);
    const last = i === visible - 1;
    if (last) {
      const dots = ".".repeat(1 + (Math.floor(t * 6) % 3));
      lines.push(pad(` ${ip}${dots}`));
    } else if (host.open) {
      lines.push(` ${ip}${accent("open")}   no auth${" ".repeat(COLS - 32)}`);
    } else {
      lines.push(pad(` ${ip}closed`));
    }
  }
  const found = HOSTS.slice(0, (step % HOSTS.length) + visible).filter((h) => h.open).length;
  lines.push(pad(` found ${found} exposed`));
  return lines.join("\n");
};

/* text2braille: a word typed in, embossed as braille dots on a label. */
const BRAILLE: Record<string, number[]> = {
  a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5], f: [1, 2, 4],
  g: [1, 2, 4, 5], h: [1, 2, 5], i: [2, 4], j: [2, 4, 5], k: [1, 3],
  l: [1, 2, 3], m: [1, 3, 4], n: [1, 3, 4, 5], o: [1, 3, 5], p: [1, 2, 3, 4],
  q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5], s: [2, 3, 4], t: [2, 3, 4, 5],
  u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6], x: [1, 3, 4, 6],
  y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6],
};
const WORDS = ["hello", "braille", "kitchen", "printed"];

const braille: Scene = (t) => {
  const period = 6;
  const word = WORDS[Math.floor(t / period) % WORDS.length];
  const typed = word.slice(0, Math.floor(fract(t / period) * period * 3));
  const cursor = Math.floor(t * 2) % 2 === 0 ? "█" : " ";
  const width = 4 + word.length * 4;
  const left = Math.floor((COLS - width) / 2);
  const indent = " ".repeat(left);
  const rows = [0, 1, 2].map((r) =>
    [...word]
      .map((ch, i) => {
        if (i >= typed.length) return "    ";
        const dots = BRAILLE[ch] ?? [];
        const l = dots.includes(r + 1) ? accent("o") : "·";
        const rr = dots.includes(r + 4) ? accent("o") : "·";
        return `${l} ${rr} `;
      })
      .join("")
  );
  const lines = [
    "",
    "",
    pad(`${" ".repeat(Math.floor((COLS - 8) / 2))}> ${typed}${cursor}`),
    "",
    "",
    `${indent}╭${"─".repeat(width - 2)}╮`,
    `${indent}│${" ".repeat(width - 2)}│`,
    ...rows.map((row) => `${indent}│ ${row}${" ".repeat(width - 3 - word.length * 4)}│`),
    `${indent}│${" ".repeat(width - 2)}│`,
    `${indent}╰${"─".repeat(width - 2)}╯`,
    `${indent} ${"▀".repeat(width - 2)}`,
  ];
  while (lines.length < ROWS) lines.push("");
  return lines.map((line) => line.replace(/^$/, " ")).join("\n");
};

/* Any other pinned repo: the spinning ASCII torus. */
const donut: Scene = (t) => {
  const A = t * 0.9;
  const B = t * 0.45;
  const chars = ".,-~:;=!*#$@";
  const out = Array.from({ length: COLS * ROWS }, () => " ");
  const depth = new Array(COLS * ROWS).fill(0);
  for (let j = 0; j < 6.28; j += 0.12) {
    for (let i = 0; i < 6.28; i += 0.04) {
      const c = Math.sin(i), d = Math.cos(j), e = Math.sin(A), f = Math.sin(j);
      const g = Math.cos(A), h = d + 2, D = 1 / (c * h * e + f * g + 5);
      const l = Math.cos(i), m = Math.cos(B), n = Math.sin(B);
      const tt = c * h * g - f * e;
      const x = Math.floor(COLS / 2 + 22 * D * (l * h * m - tt * n));
      const y = Math.floor(ROWS / 2 + 10 * D * (l * h * n + tt * m));
      const o = x + COLS * y;
      const N = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS && D > depth[o]) {
        depth[o] = D;
        out[o] = chars[Math.max(0, N)];
      }
    }
  }
  const lines: string[] = [];
  for (let y = 0; y < ROWS; y += 1) lines.push(out.slice(y * COLS, (y + 1) * COLS).join(""));
  return lines.join("\n");
};

const SCENES: Record<string, Scene> = {
  bumblebee: radar,
  geckoos: boot,
  "ollama-scout": scout,
  text2braille: braille,
};

export const sceneFor = (repo: string): Scene => SCENES[repo.toLowerCase()] ?? donut;
