import { VercelRequest, VercelResponse } from "@vercel/node";
import { parse } from "csv-parse/sync";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Readable } from "node:stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Receives text/csv content in post request
 * Needs to parse it
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");
    if (!rawBody) {
      res.status(400).end("Bad Request");
      return;
    }

    try {
      const records = parse(rawBody, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        trim: true,
      });

      // if more than 1000 rows, return error
      if (records.length > 1000) {
        console.error("Exceeds maximum of 1000 rows");
        res.status(400).end("Exceeds maximum of 1000 rows");
        return;
      }

      const columnNames = Object.keys(records[0]);

      // for each column, create a list of unique values, alphabetized
      const columnValues = columnNames.reduce<Record<string, any[]>>(
        (obj, columnName) => {
          const values = records.map((record: any) => record[columnName] ?? "");
          const uniqueValues = [...new Set(values)];
          uniqueValues.sort();
          obj[columnName] = uniqueValues;
          return obj;
        },
        {}
      );

      // send columns back to client
      res.status(200).json({ columnNames, columnValues, records });
    } catch (error) {
      console.error(error);
      res.status(500).end("Internal Server Error");
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
