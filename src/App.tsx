import { useEffect, useRef, useState } from "react";

import { AsciiArt } from "@/components/ascii-art";
import { AuroraHorizon } from "@/components/aurora-horizon";
import { DitheredPhoto } from "@/components/dithered-photo";
import { LastPush } from "@/components/last-push";
import { Scramble } from "@/components/scramble";
import { ThemeToggle } from "@/components/theme-toggle";
import pinned from "@/data/pinned.json";
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
      className="relative isolate flex min-h-svh flex-col items-center overflow-hidden pt-[22svh] pb-[34svh] sm:pt-[24svh]"
    >
      <AuroraHorizon className="absolute inset-0 -z-10" box={box} />
      <div ref={text} className="mx-auto flex w-fit max-w-3xl flex-col items-center px-6 text-center">
        <h1 className="animate-rise text-5xl font-semibold tracking-tighter sm:text-7xl md:text-8xl">
          <Scramble text="Olen Thompson" />
        </h1>
        <p className="mt-5 max-w-md animate-rise text-base text-pretty text-muted-foreground [animation-delay:150ms] sm:text-lg">
          14-year-old developer building operating systems, network tools and things for the web.
        </p>
        <div className="mt-8 flex animate-rise flex-wrap items-center justify-center gap-3 [animation-delay:300ms]">
          <a
            href="#projects"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            See my projects
          </a>
          <a
            href={GITHUB}
            className="rounded-full border border-foreground/15 bg-background/40 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors hover:border-foreground/40"
          >
            GitHub
          </a>
        </div>
        <div className="mt-8 animate-rise [animation-delay:450ms]">
          <LastPush user="Ember2819" />
        </div>
      </div>
    </section>
  );
};

type Repo = (typeof pinned)[number];

const Project = ({ repo, index }: { repo: Repo; index: number }) => {
  const flip = index % 2 === 1;
  return (
    <Reveal>
      <article className="group grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14">
        <a
          href={repo.url}
          tabIndex={-1}
          aria-hidden="true"
          className={cn(
            "relative block overflow-hidden rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] duration-500 group-hover:border-primary/40 group-hover:shadow-[0_0_60px_-20px_var(--primary)] sm:p-6",
            flip && "md:order-2"
          )}
        >
          <div className="mb-4 flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-foreground/15" />
            <span className="size-2 rounded-full bg-foreground/15" />
            <span className="size-2 rounded-full bg-foreground/15" />
            <span className="ml-3 font-mono text-[11px] text-muted-foreground">
              ~/{repo.name.toLowerCase()}
            </span>
          </div>
          <AsciiArt repo={repo.name} label={`Animated ASCII illustration of ${repo.name}`} className="overflow-hidden" />
        </a>
        <div className={cn("max-w-md", flip && "md:order-1 md:justify-self-end")}>
          <p className="font-mono text-sm text-muted-foreground">
            {repo.owner}/{repo.name}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{repo.name}</h3>
          <p className="mt-4 text-pretty text-muted-foreground">{repo.description}</p>
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {repo.language && (
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Language</dt>
                <dd>{repo.language}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Stars</dt>
              <dd className="tabular-nums">{repo.stars}</dd>
            </div>
            {repo.forks > 0 && (
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Forks</dt>
                <dd className="tabular-nums">{repo.forks}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
            <a href={repo.url} className="rounded-full border border-foreground/15 px-4 py-2 transition-colors hover:border-foreground/40">
              View source
            </a>
            {repo.homepage && (
              <a href={repo.homepage} className="rounded-full bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-85">
                Try it live
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
};

const Projects = () => (
  <section id="projects" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-24 sm:py-32">
    <Reveal className="max-w-xl">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pinned projects</h2>
      <p className="mt-3 text-muted-foreground">
        The repos pinned on my GitHub profile, synced every time this site deploys.
      </p>
    </Reveal>
    <div className="mt-16 grid gap-24 sm:mt-20 sm:gap-32">
      {pinned.map((repo, i) => (
        <Project key={repo.url} repo={repo} index={i} />
      ))}
    </div>
  </section>
);

const About = () => (
  <section id="about" className="border-t">
    <div className="mx-auto grid max-w-4xl items-center gap-10 px-6 py-24 sm:grid-cols-[220px_1fr] sm:gap-14 sm:py-32">
      <Reveal className="mx-auto w-48 sm:w-full">
        <div className="overflow-hidden rounded-2xl border bg-background">
          <DitheredPhoto src="/tux.jpg" alt="Tux the Linux penguin, my GitHub avatar" />
        </div>
      </Reveal>
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Hi, I'm Olen</h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          I'm a 14-year-old developer. I like building things that sit close to the
          machine, like kernels and network scanners, and the occasional web app
          that turns into something you can hold, like a 3D-printable braille label.
        </p>
        <p className="mt-4 text-muted-foreground">
          Most of my work lives on{" "}
          <a href={GITHUB} className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-primary">
            GitHub
          </a>
          . You can also find me on{" "}
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
