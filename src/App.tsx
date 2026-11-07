import { Voronoi } from "@/components/dithercn/voronoi";
import projects from "@/data/projects.json";

const GITHUB = "https://github.com/Ember2819";

const Hero = () => (
  <section
    id="top"
    className="relative isolate flex min-h-svh items-center justify-center overflow-hidden"
  >
    <Voronoi
      className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_65%,transparent_97%)]"
      variant="foam"
      drift={0.6}
      fade={0.8}
    />
    <h1 className="px-6 text-center text-5xl font-semibold tracking-tighter sm:text-7xl md:text-8xl">
      Olen Thompson
    </h1>
  </section>
);

type Repo = {
  name: string;
  owner: string;
  description: string;
  url: string;
  homepage: string | null;
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
      <span className="sm:w-16 sm:text-right">{MONTH.format(new Date(repo.created))}</span>
    </p>
  </li>
);

const Projects = () => (
  <section id="projects" className="mx-auto max-w-5xl scroll-mt-8 px-6 py-24 sm:py-32">
    <h2 className="mb-12 text-3xl font-semibold tracking-tight">Projects</h2>
    <h3 className="mb-3 font-mono text-xs text-muted-foreground">
      pinned <span className="text-foreground/30">({projects.pinned.length})</span>
    </h3>
    <ul className="border-b">
      {projects.pinned.map((repo) => (
        <Row key={repo.url} repo={repo} />
      ))}
    </ul>
  </section>
);

const Footer = () => (
  <footer className="border-t">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono">Olen Thompson</p>
      <div className="flex gap-5">
        <a href={GITHUB} className="transition-colors hover:text-foreground">GitHub</a>
      </div>
    </div>
  </footer>
);

const App = () => (
  <>
    <main>
      <Hero />
      <Projects />
    </main>
    <Footer />
  </>
);

export default App;
