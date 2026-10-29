import { useEffect, useRef, useState } from "react";

import { AuroraHorizon } from "@/components/aurora-horizon";
import { DitheredPhoto } from "@/components/dithered-photo";
import { LastPush } from "@/components/last-push";
import { Scramble } from "@/components/scramble";
import { ThemeToggle } from "@/components/theme-toggle";
import projects from "@/data/projects.json";
import { cn } from "@/lib/utils";

const GITHUB = "https://github.com/Ember2819";
const X = "https://x.com/ember2819";
const SITE = "https://phishersofmen.net";

type Box = readonly [number, number, number, number];

/** The text block's box inside the hero, in the field's uv space, padded by `pad` px. */
const useClearBox = (
  section: React.RefObject<HTMLElement | null>,
  text: React.RefObject<HTMLElement | null>,
  pad = 28
): Box => {
  const [box, setBox] = useState<Box>([0.5, 0.5, 0, 0]);
  useEffect(() => {
    const host = section.current;
    const block = text.current;
    if (!(host && block)) return;
    const measure = () => {
      const s = host.getBoundingClientRect();
      const r = block.getBoundingClientRect();
      if (s.width === 0 || s.height === 0) return;
      setBox([
        (r.left - s.left + r.width / 2) / s.width,
        1 - (r.top - s.top + r.height / 2) / s.height,
        (r.width / 2 + pad) / s.width,
        (r.height / 2 + pad) / s.height,
      ]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(block);
    return () => observer.disconnect();
  }, [section, text, pad]);
  return box;
};

/** Fades its children up once they scroll into view. */
const Reveal = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-[opacity,translate] motion-safe:duration-1000 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)]",
        shown ? "translate-y-0 opacity-100" : "motion-safe:translate-y-6 motion-safe:opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

const Nav = () => (
  <header className="absolute inset-x-0 top-0 z-10">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <a href="#top" className="font-mono text-sm tracking-tight">
        olen<span className="text-primary">@</span>thompson
      </a>
      <div className="flex items-center gap-1 text-sm">
        <a href="#projects" className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
          Projects
        </a>
        <a href="#about" className="hidden rounded-full px-3 py-1.5 text-muted-foreground sm:inline-block transition-colors hover:text-foreground">
          About
        </a>
        <a href={GITHUB} className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
          GitHub
        </a>
        <ThemeToggle />
      </div>
    </nav>
  </header>
);

const Hero = () => {
  const section = useRef<HTMLElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const box = useClearBox(section, text);
  return (
    <section
      ref={section}
      id="top"
      className="relative isolate flex min-h-svh flex-col items-center overflow-hidden pt-[30svh] pb-[34svh]"
    >
      <AuroraHorizon className="absolute inset-0 -z-10" box={box} />
      <div ref={text} className="mx-auto flex w-fit flex-col items-center px-6 text-center">
        <h1 className="animate-rise text-5xl font-semibold tracking-tighter sm:text-7xl md:text-8xl">
          <Scramble text="Olen Thompson" />
        </h1>
        <div className="mt-6 animate-rise [animation-delay:300ms]">
          <LastPush user="Ember2819" />
        </div>
      </div>
    </section>
  );
};

type Repo = {
  name: string;
  owner: string;
  description: string;
  url: string;
  homepage: string | null;
  stars: number;
  language: string | null;
  created: string;
};

const MONTH = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

const Row = ({ repo }: { repo: Repo }) => (
  <li className="grid gap-x-8 gap-y-1 border-t py-4 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:items-baseline">
    <div className="flex items-baseline gap-3">
      <a href={repo.url} className="font-medium underline-offset-4 hover:underline">
        {repo.owner === "Ember2819" ? repo.name : `${repo.owner}/${repo.name}`}
      </a>
      {repo.homepage && (
        <a href={repo.homepage} className="font-mono text-xs text-primary underline-offset-4 hover:underline">
          live
        </a>
      )}
    </div>
    <p className="text-pretty text-muted-foreground">{repo.description}</p>
    <p className="flex gap-4 font-mono text-xs text-muted-foreground tabular-nums sm:justify-end">
      {repo.language && <span>{repo.language}</span>}
      {repo.stars > 0 && <span>★ {repo.stars}</span>}
      <span className="sm:w-16 sm:text-right">{MONTH.format(new Date(repo.created))}</span>
    </p>
  </li>
);

const List = ({ title, repos }: { title: string; repos: Repo[] }) => (
  <Reveal className="mt-14 first:mt-0">
    <h3 className="mb-3 font-mono text-xs text-muted-foreground">
      {title} <span className="text-foreground/30">({repos.length})</span>
    </h3>
    <ul className="border-b">
      {repos.map((repo) => (
        <Row key={repo.url} repo={repo} />
      ))}
    </ul>
  </Reveal>
);

const Projects = () => (
  <section id="projects" className="mx-auto max-w-5xl scroll-mt-8 px-6 py-24 sm:py-32">
    <h2 className="mb-12 text-3xl font-semibold tracking-tight">Projects</h2>
    <List title="pinned" repos={projects.pinned} />
    <List title="everything else" repos={projects.other} />
  </section>
);

const About = () => (
  <section id="about" className="border-t">
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-24 sm:grid-cols-[160px_1fr] sm:gap-12">
      <Reveal className="w-32 sm:w-full">
        <div className="overflow-hidden rounded-lg border bg-background">
          <DitheredPhoto src="/tux.jpg" alt="Tux the Linux penguin, my GitHub avatar" />
        </div>
      </Reveal>
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight">About</h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          I'm Olen, I'm 14 and I write code. It's all on{" "}
          <a href={GITHUB} className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-primary">
            GitHub
          </a>
          , and I'm on{" "}
          <a href={X} className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-primary">
            X
          </a>
          .
        </p>
      </Reveal>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono">
        olen<span className="text-primary">@</span>thompson:~$ <span className="motion-safe:animate-pulse">_</span>
      </p>
      <div className="flex gap-5">
        <a href={GITHUB} className="transition-colors hover:text-foreground">GitHub</a>
        <a href={X} className="transition-colors hover:text-foreground">X</a>
        <a href={SITE} className="transition-colors hover:text-foreground">phishersofmen.net</a>
      </div>
    </div>
  </footer>
);

const App = () => (
  <>
    <Nav />
    <main>
      <Hero />
      <Projects />
      <About />
    </main>
    <Footer />
  </>
);

export default App;
