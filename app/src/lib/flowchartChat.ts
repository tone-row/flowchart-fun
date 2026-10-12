import { deflateRaw } from "pako";

export type FlowchartChatChart = { title?: string; text: string };

/**
 * Link to flowchart.chat with UTM tags. With a chart, the hash carries
 * `#v1=` + base64url (unpadded) of deflateRaw(UTF-8 JSON of { title, text }),
 * which flowchart.chat decodes to open the chart.
 */
export function flowchartChatUrl(
  medium: string,
  chart?: FlowchartChatChart
): string {
  const url = new URL("https://flowchart.chat/");
  url.searchParams.set("utm_source", "flowchart.fun");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "crosslink");
  if (chart) {
    const json = JSON.stringify({ title: chart.title, text: chart.text });
    url.hash = `v1=${toBase64Url(deflateRaw(json))}`;
  }
  return url.toString();
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
