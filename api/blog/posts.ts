import { VercelRequest, VercelResponse } from "@vercel/node";
import { dateAsNumber, dateString, niceDate } from "../_lib/_dates";
import { notion, getNestedProperties } from "../_lib/_notion";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  res.json(posts);
}
