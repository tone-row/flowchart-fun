import { t } from "@lingui/macro";

export function getDefaultText() {
  return `${t`Begin Typing`}
  ${t`Consider: Adding a Label`}
    ${t`Yes: Option A`}
      ${t`Use an ID to Connect`} #connect
    ${t`No: Option B`}
      (#connect)
        ${t`Now erase the text and try it yourself!`}
`;
}
