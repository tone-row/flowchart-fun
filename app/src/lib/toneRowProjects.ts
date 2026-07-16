import { t } from "@lingui/macro";

export const TONE_ROW_URL = "https://tone-row.com";

/**
 * Other Tone Row apps, cross-linked from the homepage, pricing page, and
 * settings page. Descriptions are lazy so they resolve in the active locale.
 */
export const toneRowProjects = [
  {
    name: "TeamSort",
    domain: "teamsort.world",
    href: "https://teamsort.world",
    description: () => t`Group ranking and ranked-choice voting, free`,
  },
  {
    name: "Docugram",
    domain: "docugram.app",
    href: "https://docugram.app",
    description: () => t`Turn documents into diagrams with AI`,
  },
];
