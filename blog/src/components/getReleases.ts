import { Octokit } from "@octokit/core";
import fake from "./fakeData.json";

export async function getReleases() {
  if (import.meta.env.MODE === "development") {
    return fake;
  }

  const octokit = new Octokit({
    auth: import.meta.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  });

  let response = await octokit.request("GET /repos/{owner}/{repo}/releases", {
    owner: "tone-row",
    repo: "flowchart-fun",
  });

  return response.data;
}
