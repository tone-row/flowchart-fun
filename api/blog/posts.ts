import { VercelRequest, VercelResponse } from "@vercel/node";
import { niceDate } from "../_lib/_dates";
import { notion } from "../_lib/_notion";
import { z } from "zod";
import { BlogPost, NotionPost } from "shared";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const response = await notion.databases.query({
    database_id: "b7a09b10aa83485b94092269239a8b38",
  });

  const notionPosts = response.results.filter(
    isValidNotionPost
  ) as unknown as NotionPost[];

  const posts = notionPosts.map(notionPostToBlogPost);

  // Cache for 1 week, stale-while-revalidate
  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

  res.json(posts);
}

const postSchema: z.ZodType<NotionPost> = z.object({
  id: z.string(),
  created_time: z.string(),
  properties: z.object({
    title: z.object({
      title: z.array(z.object({ plain_text: z.string() })).min(1),
    }),
    description: z.object({
      rich_text: z.array(z.object({ plain_text: z.string() })).min(1),
    }),
    status: z.object({
      status: z.object({ name: z.string() }),
    }),
    slug: z.object({
      rich_text: z.array(z.object({ plain_text: z.string() })).min(1),
    }),
  }),
});

function isValidNotionPost(post: unknown): post is NotionPost {
  const parsed = postSchema.safeParse(post);
  if (parsed.success) return true;
  return false;
}

function notionPostToBlogPost(post: NotionPost): BlogPost {
  return {
    id: post.id,
    publishDate: new Date(post.created_time).getTime(),
    niceDate: niceDate(new Date(post.created_time)),
    description: post.properties.description.rich_text[0].plain_text,
    slug: post.properties.slug.rich_text[0].plain_text,
    status: post.properties.status.status.name,
    title: post.properties.title.title[0].plain_text,
  };
}
