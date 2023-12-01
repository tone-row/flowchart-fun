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
        };
      }
    }
    return block;
  });

  const mdString = n2m.toMarkdownString(mdblocks);
  const html = marked(mdString);
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
    parent: '[image](https://prod-files-secure.s3.us-west-2.amazonaws.com/a265786d-536c-4941-ae56-0ccd9fd531c8/7b8ed0d9-2c58-498d-adc6-ff19e0a5b7f5/Untitled.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20231201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20231201T201105Z&X-Amz-Expires=3600&X-Amz-Signature=3f9df89d9982ec9135e374f09c45b18ed7991b8dddd9ee636cbbadbf1bf12688&X-Amz-SignedHeaders=host&x-id=GetObject)',
    children: []
  }

  and returns an HTML <video /> element with audio muted and autoplay, looping enabled

 */
function videoBlockToHtml(block: any) {
  const markdown = block.parent;
  const url = markdown.match(/\(([^)]+)\)/)[1];
  if (url) return `<video src="${url}" muted autoplay loop></video>`;

  return null;
}
