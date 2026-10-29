// Refreshes src/data/projects.json (the repos pinned on github.com/Ember2819)
// and src/data/contributions.json (the contribution calendar). Needs a
// GITHUB_TOKEN (the Actions token works). Without one, or if GitHub errors,
// it keeps the committed files so the build never breaks.
import { writeFile } from "node:fs/promises";

const LOGIN = "Ember2819";
const PROJECTS_OUT = new URL("../src/data/projects.json", import.meta.url);
const CONTRIBUTIONS_OUT = new URL("../src/data/contributions.json", import.meta.url);
const token = process.env.GITHUB_TOKEN;

const REPO = `
  name
  owner { login }
  description
  url
  homepageUrl
  stargazerCount
  forkCount
  primaryLanguage { name }
  createdAt
  pushedAt
`;

const query = `{
  user(login: "${LOGIN}") {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { ${REPO} } }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

if (!token) {
  console.log("sync-pinned: no GITHUB_TOKEN, keeping the committed projects.json");
  process.exit(0);
}

const shape = (repo) => ({
  name: repo.name,
  owner: repo.owner.login,
  description: repo.description ?? "",
  url: repo.url,
  homepage: repo.homepageUrl || null,
  stars: repo.stargazerCount,
  forks: repo.forkCount,
  language: repo.primaryLanguage?.name ?? null,
  created: repo.createdAt.slice(0, 10),
  pushed: repo.pushedAt.slice(0, 10),
});

try {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await response.json();
  const user = json?.data?.user;
  if (!response.ok || !Array.isArray(user?.pinnedItems?.nodes) || user.pinnedItems.nodes.length === 0) {
    throw new Error(JSON.stringify(json.errors ?? response.status));
  }
  const pinned = user.pinnedItems.nodes.map(shape);
  await writeFile(PROJECTS_OUT, `${JSON.stringify({ pinned }, null, 2)}\n`);
  console.log(`sync-pinned: wrote ${pinned.length} pinned repos`);

  const calendar = user.contributionsCollection?.contributionCalendar;
  if (calendar) {
    const days = calendar.weeks
      .flatMap((week) => week.contributionDays)
      .map((day) => ({ date: day.date, value: day.contributionCount }));
    await writeFile(CONTRIBUTIONS_OUT, `${JSON.stringify({ total: calendar.totalContributions, days })}\n`);
    console.log(`sync-pinned: wrote ${days.length} contribution days (${calendar.totalContributions} total)`);
  }
} catch (error) {
  console.warn(`sync-pinned: GitHub request failed, keeping the committed file (${error.message})`);
}
