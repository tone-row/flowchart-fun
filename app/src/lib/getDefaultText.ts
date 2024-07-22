import { t } from "@lingui/macro";

export function getDefaultText() {
  return `${t`Welcome to Flowchart Fun!`}
  ${t`Get Started`}: ${t`Modify the text to see it transform into a flowchart on the right.`}
  ${t`Understanding Syntax`} .shape_circle.color_orange
    ${t`Begin Typing`}: ${t`Start with a label or decision.`}
    ${t`Decisions`}: ${t`Use colons, like "Explore options:".`}
    ${t`Indent for steps`}: ${t`Show progression or dependency.`}
    ${t`Customize`}: ${t`Add classes to alter color and shape`} \\(.color_blue)
    ${t`Right-click on nodes to see more options.`}
  ${t`Use AI`} .color_green
    ${t`Paste a document or outline to auto-convert into a flowchart.`}
  ${t`Share Your Work`} .color_blue
    ${t`Download or convert your flowchart via the 'Share' button.`}
`;
}
