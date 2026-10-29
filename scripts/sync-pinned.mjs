// Refreshes src/data/projects.json from github.com/Ember2819: the pinned repos,
// then every other public, non-fork repo with a description, most recently
// pushed first. Needs a GITHUB_TOKEN (the Actions token works). Without one,
// or if GitHub errors, it keeps the committed file so the build never breaks.
import { writeFile } from "node:fs/promises";

const LOGIN = "Ember2819";
const OUT = new URL("../src/data/projects.json", import.meta.url);
// The profile README and this site are repos, but not projects.
const SKIP = new Set([LOGIN, `${LOGIN}.github.io`].map((name) => name.toLowerCase()));
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
    repositories(first: 100, privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER, orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes { ${REPO} }
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
  const taken = new Set(pinned.map((repo) => repo.url));
  const other = user.repositories.nodes
    .filter((repo) => repo.description && !taken.has(repo.url) && !SKIP.has(repo.name.toLowerCase()))
    .map(shape);
  await writeFile(OUT, `${JSON.stringify({ pinned, other }, null, 2)}\n`);
  console.log(`sync-pinned: wrote ${pinned.length} pinned and ${other.length} other repos`);
} catch (error) {
  console.warn(`sync-pinned: GitHub request failed, keeping the committed file (${error.message})`);
}
