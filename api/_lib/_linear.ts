import { marked } from "marked";

import { IssueConnection, LinearClient } from "@linear/sdk";

const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

export async function getIssues() {
  let initialIssues: IssueConnection["nodes"];
  if (process.env.NODE_ENV === "development") {
    initialIssues = (require("../_fixtures/issues.json") as IssueConnection)
      .nodes;
  } else {
    initialIssues = await getLinearIssues();
  }

  const issues = initialIssues.map((issue) => {
    return {
      title: issue.title,
      description: marked.parse(issue.description ?? ""),
    };
  });

  return issues;
}

async function getLinearIssues() {
  const ff = await linear.team("FF");
  const issues = await ff.issues({
    first: 10,
    filter: {
      // priority: { lte: 2, neq: 0 }
      state: { name: { eq: "Todo" } },
    },
  });
  return issues.nodes;
}
