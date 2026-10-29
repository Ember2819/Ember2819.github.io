// Refreshes src/data/pinned.json from the repos pinned on github.com/Ember2819.
// Needs a GITHUB_TOKEN (the Actions token works). Without one, or if GitHub
// errors, it keeps the committed file so the build never breaks.
import { writeFile } from "node:fs/promises";

const LOGIN = "Ember2819";
const OUT = new URL("../src/data/pinned.json", import.meta.url);
const token = process.env.GITHUB_TOKEN;

const query = `{
  user(login: "${LOGIN}") {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          owner { login }
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          primaryLanguage { name }
        }
      }
    }
  }
}`;

if (!token) {
  console.log("sync-pinned: no GITHUB_TOKEN, keeping the committed pinned.json");
  process.exit(0);
}

try {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await response.json();
  const nodes = json?.data?.user?.pinnedItems?.nodes;
  if (!response.ok || !Array.isArray(nodes) || nodes.length === 0) {
    throw new Error(JSON.stringify(json.errors ?? response.status));
  }
  const pinned = nodes.map((repo) => ({
    name: repo.name,
    owner: repo.owner.login,
    description: repo.description ?? "",
    url: repo.url,
    homepage: repo.homepageUrl || null,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    language: repo.primaryLanguage?.name ?? null,
  }));
  await writeFile(OUT, `${JSON.stringify(pinned, null, 2)}\n`);
  console.log(`sync-pinned: wrote ${pinned.length} repos`);
} catch (error) {
  console.warn(`sync-pinned: GitHub request failed, keeping the committed file (${error.message})`);
}
