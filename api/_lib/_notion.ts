import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import hljs from "highlight.js";
import { marked } from "marked";

const auth = process.env.NOTION_ACCESS_TOKEN;
if (!auth) throw new Error("NOTION_ACCESS_TOKEN is not defined");

// Initializing a client
export const notion = new Client({
  auth,
});

export const n2m = new NotionToMarkdown({ notionClient: notion });

type Properties = Extract<
  QueryDatabaseResponse["results"][number],
  { properties: unknown }
>["properties"];

/**
 * Returns the nested properties of a Notion page on an object using the same keys
 */
export function getNestedProperties(properties: Properties) {
  const props: Record<string, string> = {};
  for (const key in properties) {
    const property = properties[key];
    if ("title" in property) {
      props[key] = property.title[0].plain_text;
    } else if ("rich_text" in property) {
      props[key] = property.rich_text[0].plain_text;
    } else if ("date" in property) {
      const pDate = property.date;
      if (pDate) {
        props[key] = pDate.start;
      }
    } else if ("status" in property) {
      const status = property["status"] as { name: string };
      if (status) {
        props[key] = status.name;
      }
    } else {
      console.log("Unknown property", key, property);
    }
  }
  return props;
}

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
});

export async function getPostHtmlFromId(id: string) {
  const mdblocks = await n2m.pageToMarkdown(id);
  const mdString = n2m.toMarkdownString(mdblocks);
  const html = marked(mdString);
  return html;
}
