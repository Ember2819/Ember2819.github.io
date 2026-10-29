import { useEffect, useState } from "react";

import { Loader } from "@/components/dithercn/loader";

type Push = { name: string; url: string; at: Date };

const ago = (date: Date) => {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const seconds = (date.getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
};

/** The most recent push to one of my own repos, live from the GitHub API. */
export const LastPush = ({ user }: { user: string }) => {
  const [push, setPush] = useState<Push | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=10`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((repos: { name: string; html_url: string; pushed_at: string; fork: boolean }[]) => {
        const repo = repos.find((r) => !r.fork);
        if (!repo) throw new Error("no repos");
        setPush({ name: repo.name, url: repo.html_url, at: new Date(repo.pushed_at) });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setFailed(true);
        void error;
      });
    return () => controller.abort();
  }, [user]);

  if (failed) return null;

  return (
    <p className="flex min-h-6 items-center gap-2.5 text-sm text-muted-foreground">
      <Loader size="sm" label={push ? "Live" : "Loading latest activity"} />
      {push ? (
        <span>
          Last pushed to{" "}
          <a href={push.url} className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-primary">
            {push.name}
          </a>{" "}
          {ago(push.at)}
        </span>
      ) : (
        <span>Checking GitHub</span>
      )}
    </p>
  );
};
