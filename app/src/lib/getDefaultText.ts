import { t } from "@lingui/macro";

export function getDefaultText() {
  return `${t`Welcome to Flowchart Fun!`}
  ${t`Start`}: ${t`Modify text to see it transform into a flowchart on the right.`}
  ${t`Understand Syntax`} .shape_circle
    ${t`Begin Typing`}: ${t`Start with a label or decision.`}
    ${t`Decisions`}: ${t`Use colons like "Decisions:".`}
    ${t`Indent for Steps`}: ${t`Indicate progression or dependency.`}
    ${t`Customize`}: ${t`Add classes to change color and shape`} \\(.color_red)
    ${t`Right-click nodes for more options.`}
  ${t`Use AI`} .color_green
    ${t`Paste a document to convert it into a flowchart.`}
  ${t`Share Your Work`} .color_blue
    ${t`Download or share your flowchart using the 'Share' button.`}
`;
}
