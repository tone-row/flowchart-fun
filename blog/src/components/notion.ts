import { Client } from "@notionhq/client";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { dateAsNumber, dateString, niceDate } from "./niceData";
import { NotionToMarkdown } from "notion-to-md";
import { marked } from "marked";
import hljs from "highlight.js";

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
});

const auth = import.meta.env.NOTION_ACCESS_TOKEN;
if (!auth) throw new Error("NOTION_ACCESS_TOKEN is not defined");

// Initializing a client
const notion = new Client({
  auth,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

export async function getPosts() {
  const response = await notion.databases.query({
    database_id: "b7a09b10aa83485b94092269239a8b38",
  });
  const posts = response.results.map((page) => {
    if (!("properties" in page)) throw new Error("No properties");
    const { properties = {}, id } = page;
    const { date, ...props } = getNestedProperties(properties);
    if (!("title" in props)) throw new Error("No title");
    if (!("status" in props)) throw new Error("No status");
    if (!("slug" in props)) throw new Error("No slug");
    if (!("description" in props)) throw new Error("No description");

    if (!date) throw new Error("No date");

    let sanitizedDate = dateString(date);
    let publishDate = niceDate(date);
    let rawDate = dateAsNumber(date);

    return { id, rawDate, date: sanitizedDate, publishDate, ...props };
  });
  return posts;
}

type Properties = Extract<
  QueryDatabaseResponse["results"][number],
  { properties: any }
>["properties"];

type Status = "Not Started" | "In Progress" | "Done";

/**
 * Returns the nested properties of a Notion page on an object using the same keys
 */
function getNestedProperties(properties: Properties) {
  const props: any = {};
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
      const status = property.status as { name: string };
      if (status) {
        props[key] = status.name;
      }
    } else {
      console.log("Unknown property", key, property);
    }
  }
  return props;
}

export async function getPostFromSlug(slug: string) {
  const posts = await getPosts();
  const post = posts.find((post) => post.slug === slug);
  if (!post) throw new Error("Post not found");
  return post;
}

export async function getPostHtmlFromId(id: string) {
  const mdblocks = await n2m.pageToMarkdown(id);
  const mdString = n2m.toMarkdownString(mdblocks);
  const html = marked(mdString);
  return html;
}
