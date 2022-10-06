import { LinearClient } from "@linear/sdk";
import fakeIssues from "./fakeIssues.json";

const linear = new LinearClient({
  apiKey: import.meta.env.LINEAR_API_KEY,
});

export async function getIssues() {
  if (import.meta.env.MODE === "development") return fakeIssues;

  const ff = await linear.team("FF");
  const issues = await ff.issues({
    first: 10,
    filter: {
      // priority: { lte: 2, neq: 0 }
      state: { name: { eq: "Todo" } },
    },
  });

  return issues;
}
