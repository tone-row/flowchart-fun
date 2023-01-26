import { Octokit } from "@octokit/core";
import { marked } from "marked";
import { niceDateIso } from "./_dates";

export async function getReleases() {
  let initialReleases = [];

  if (process.env.NODE_ENV === "development") {
    initialReleases = require("../_fixtures/releases.json") as Awaited<
      ReturnType<typeof githubReleases>
    >;
  } else {
    initialReleases = await githubReleases();
  }

  if (!initialReleases) return [];

  const releases = initialReleases.map((release) => ({
    id: release.id,
    name: release.name,
    date: release.published_at,
    niceDate: niceDateIso(release.published_at ?? ""),
    body: marked.parse(release.body ?? ""),
    url: release.html_url,
  }));

  return releases;
}

async function githubReleases() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  });

  const response = await octokit.request("GET /repos/{owner}/{repo}/releases", {
    owner: "tone-row",
    repo: "flowchart-fun",
  });

  return response.data;
}
