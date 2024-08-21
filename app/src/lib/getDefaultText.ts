import { t } from "@lingui/macro";

export function getDefaultText() {
  return `${t`Welcome to Flowchart Fun`}
  ${t`Begin your journey`}
    ${t`Add some steps`}
      ${t`Step 1`}: ${t`Write like an outline`}
      ${t`Step 2`}: ${t`Each line becomes a node`}
      ${t`Step 3`}: ${t`Indent to connect nodes`}
    ${t`Style with classes`}
      ${t`Green?`} .color_green
      ${t`Or maybe blue!`} .color_blue
    ${t`Wrap text in parentheses to connect to any node`}
      ${t`Link back`}: (${t`Begin your journey`})
  ${t`Time to decide`}: ${t`What's next?`}
    ${t`Explore more`}: ${t`Right-click nodes for options`}
    ${t`Try AI`}: ${t`Paste a document to convert it`}
    ${t`Keep practicing`}: ${t`You're doing great!`}
      ${t`Now you're thinking with flowcharts!`}
`;
}
