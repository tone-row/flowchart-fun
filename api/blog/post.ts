import { VercelRequest, VercelResponse } from "@vercel/node";
import { niceDate } from "../_lib/_dates";
import {
  notion,
  getNestedProperties,
  getPostHtmlFromId,
} from "../_lib/_notion";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = req.query.slug;
  if (!slug || typeof slug != "string") throw new Error("No slug");

  // get notion post form column slug
  const response = await notion.databases.query({
    database_id: "b7a09b10aa83485b94092269239a8b38",
    filter: {
      property: "slug",
      text: {
        equals: slug,
      },
    },
  });

  if (!response.results.length) throw new Error("No results");

  const post = response.results[0];

  if (!("properties" in post)) throw new Error("No properties");
  const { properties = {}, id } = post;
  const { date, ...props } = getNestedProperties(properties);
  let publishDate = niceDate(date);

  const htmlContent = await getPostHtmlFromId(id);

  res.json({ id, htmlContent, publishDate, ...props });
}
