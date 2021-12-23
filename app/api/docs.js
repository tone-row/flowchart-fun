const dbId = "d5f40c86fade464698575fdadaac61dc";

export default async function server(req, res) {
  const { Client } = require("@notionhq/client");
  const notion = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

  const { results } = await notion.databases.query({ database_id: dbId });
  const pageIds = results
    .sort((a, b) => a.properties.Order.number - b.properties.Order.number)
    .map((page) => page.id);
  const pages = [];

  for (let page_id of pageIds) {
    const page = await notion.pages.retrieve({ page_id });
    const title = page.properties.Section.title[0].plain_text;
    const children = (
      await notion.blocks.children.list({ block_id: page_id })
    ).results.map(getChild);
    pages.push({ id: page_id, title, html: children.join("\n") });
  }

  res.json({ data: pages[0].html });
}

function getChild(child) {
  const { type } = child;
  switch (type) {
    case "paragraph":
      let s = "<p>";
      for (let text of child.paragraph.text) {
        s += getText(text);
      }
      s += "</p>";
      return s;
    case "heading_2":
      const h2 = child.heading_2.text[0].plain_text;
      return `<h2 id="${h2.toLowerCase().replace(/ /g, "-")}">${h2}</h2>`;
    case "heading_3":
      const h3 = child.heading_3.text[0].plain_text;
      return `<h3 id="${h3.toLowerCase().replace(/ /g, "-")}">${h3}</h3>`;
    case "code":
      return `<pre class="code-sample"><code>${child.code.text[0].plain_text}</code></pre>`;
    case "video":
      return `<video playsinline autoplay muted loop><source src="${child.video.file.url}" type="video/mp4" />Your browser does not support the video tag.</video>`;
    case "image":
      return `<img src="${child.image.file.url}" />`;
    default:
      console.log("Unknown Type: " + type);
      return "";
  }
}

function getText({ text, annotations }) {
  const { bold, code } = annotations;
  if (bold) {
    return `<strong>${text.content}</strong>`;
  }
  if (code) {
    return `<code>${text.content}</code>`;
  }
  return text.content;
}
