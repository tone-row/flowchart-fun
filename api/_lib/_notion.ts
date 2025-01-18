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
  let mdblocks = await n2m.pageToMarkdown(id);
  // convert video blocks to HTML
  mdblocks = mdblocks.map((block) => {
    if (block.type === "video") {
      const videoHtml = videoBlockToHtml(block);
      if (videoHtml) {
        return {
          type: "html",
          parent: videoHtml,
          children: [],
          blockId: block.blockId,
        };
      }
    }
    return block;
  });

  const mdString = n2m.toMarkdownString(mdblocks);
  const html = marked(mdString.parent);
  return html;
}

// tonerow/Flowchart-Fun-Areas-of-Research-6797865c1d744aa0babbea7d1558e8b3
const AREAS_OF_RESEARCH_PAGE_ID = "6797865c1d744aa0babbea7d1558e8b3";
export async function getAreasOfResearchHtml() {
  return await getPostHtmlFromId(AREAS_OF_RESEARCH_PAGE_ID);
}

/**

Takes a block in the format
{
    type: 'video',
    parent: '[image](url)',
    children: []
  }

  and returns an HTML <video /> element with audio muted and autoplay, looping enabled

 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function videoBlockToHtml(block: any) {
  const markdown = block.parent;
  const url = markdown.match(/\(([^)]+)\)/)[1];
  if (url) return `<video src="${url}" muted autoplay loop></video>`;

  return null;
}
