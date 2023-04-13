import { t } from "@lingui/macro";

export function getDefaultText() {
  const defaultText = `${t`This app works by typing`}
  ${t`Indenting creates an edge`}
  ${t`any text: before a colon creates a label`}
    ${t`Click on \nLearn Syntax\nto learn more`} .blue.border-none.roundrectangle[w=100][h=70]
  ${t`You can also wrap text in "\( \)" to create an edge`}
    ${t`(before a colon creates a label)`}`;
  return defaultText;
}
