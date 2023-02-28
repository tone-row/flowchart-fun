import { Hocuspocus } from "@hocuspocus/server";
import { supabase } from "./supabase.mjs";
import { Database } from "@hocuspocus/extension-database";
import * as Y from "yjs";
import merge from "deepmerge";
import matter from "gray-matter";

let port = 1234;
if (process.env.RAILWAY_ENVIRONMENT) {
  port = parseInt(process.env.PORT);
}

// Configure the server …
const server = new Hocuspocus({
  port,
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        // create ydoc
        const ydoc = new Y.Doc();
        // create ytext
        const ytext = ydoc.getText("text");
        // meta
        const ymeta = ydoc.getMap("meta");
        try {
          const [_docType, id] = documentName.split("-");
          const { data, error } = await supabase
            .from("user_charts")
            .select("id,name,chart,updated_at,created_at,public_id,is_public")
            .eq("id", id);
          if (error) throw error;
          if (!data || data.length === 0) throw new Error("Invalid Chart ID");
          if (data.length > 1) throw new Error("Multiple Charts Found");
          /** @type {string} */
          const flowchart = data[0].chart;
          const { text, meta } = prepareChart(flowchart);

          // initialize ytext with the flowchart
          ytext.insert(0, text);

          // initialize meta
          Object.keys(meta).forEach((key) => {
            ymeta.set(key, meta[key]);
          });
        } catch (e) {
          console.log(e);
        }

        return Y.encodeStateAsUpdate(ydoc);
      },
      store: async ({ documentName, state }) => {
        const [_docType, id] = documentName.split("-");

        // get "text" string from state buffer
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, state);
        const ytext = ydoc.getText("text");
        const text = ytext.toString();

        // get meta
        const ymeta = ydoc.getMap("meta");
        /**
         * @type {object}
         * */
        const meta = {};
        ymeta.forEach((value, key) => {
          meta[key] = value;
        });

        const chart = docToString({ text, meta });
        const { error } = await supabase
          .from("user_charts")
          .update({ chart })
          .eq("id", id);
        if (error) throw error;
        return true;
      },
    }),
  ],
  async onConnect() {
    console.log("Client connected");
  },
});

// … and run it!
server.listen(async () => {
  console.log(`Server running on port ${port}`);
});

/**
 *
 * @param {string} doc
 * @returns
 */
const newDelimiters = "=====";
export function prepareChart(doc) {
  const delimiters = "~~~";
  const HIDDEN_GRAPH_OPTIONS_DIVIDER = "¼▓╬";
  let text = doc;

  let jsonMeta = {};
  // if the doc includes the new delimiters we can skip the migration step
  if (text.includes(newDelimiters)) {
    const parts = text.split(newDelimiters);
    text = parts[0];
    const metaStr = parts[1] || "{}";
    try {
      jsonMeta = JSON.parse(metaStr.trim());
    } catch (e) {
      console.log(e);
    }
  }

  let hidden = {};
  if (text.includes(HIDDEN_GRAPH_OPTIONS_DIVIDER)) {
    const parts = text.split(HIDDEN_GRAPH_OPTIONS_DIVIDER);
    text = parts[0];
    const hiddenStr = parts[1] || "{}";
    try {
      hidden = JSON.parse(hiddenStr.trim());
    } catch (e) {
      console.log(e);
    }
  }

  let parsedData = {};
  if (text.includes(delimiters)) {
    const parsed = matter(text, { delimiters });
    text = parsed.content;
    parsedData = parsed.data;
  }

  /**
   * @type {object}
   */
  const meta = merge.all([jsonMeta, parsedData, hidden]);

  // Because the new getDefaultChart() will return with graph-selector in the meta
  // and people have had to intentionally switch to graph selector thus far
  // if we get to this point and DON'T have a parser in the meta, we can assume
  // that it's the v1 parser, and we'll add it to keep compatibility
  if (!meta.parser) {
    meta.parser = "v1";
  }

  text = `${text.trim()}\n`;

  return {
    text,
    meta,
  };
}

/**
 *
 * @param {{text: string; meta: object}} doc
 * @returns
 */
function docToString(doc) {
  const { text, meta } = doc;
  return [
    text,
    newDelimiters,
    JSON.stringify(meta, null, 2),
    newDelimiters,
  ].join("\n");
}
