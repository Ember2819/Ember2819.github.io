import { useEffect, useState } from "react";

import { Loader } from "@/components/dithercn/loader";

type Activity = { kind: "push" | "pr"; repo: string; url: string; at: Date };

type GithubEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: { action?: string; number?: number };
};

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

/** My latest public push or opened pull request, to any repo, live from the GitHub API. */
export const LastPush = ({ user }: { user: string }) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${user}/events/public?per_page=100`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((events: GithubEvent[]) => {
        const latest = events
          .flatMap((event): Activity[] => {
            const at = new Date(event.created_at);
            const repo = event.repo.name;
            if (event.type === "PushEvent") {
              return [{ kind: "push", repo, url: `https://github.com/${repo}`, at }];
            }
            if (event.type === "PullRequestEvent" && event.payload.action === "opened") {
              return [{ kind: "pr", repo, url: `https://github.com/${repo}/pull/${event.payload.number}`, at }];
            }
            return [];
          })
          .sort((a, b) => b.at.getTime() - a.at.getTime())[0];
        if (!latest) throw new Error("no recent activity");
        setActivity(latest);
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
      <Loader size="sm" label={activity ? "Live" : "Loading latest activity"} />
      {activity ? (
        <span>
          {activity.kind === "push" ? "Last pushed to" : "Last opened a PR in"}{" "}
          <a href={activity.url} className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-primary">
            {activity.repo}
          </a>{" "}
          {ago(activity.at)}
        </span>
      ) : (
        <span>Checking GitHub</span>
      )}
    </p>
  );
};
