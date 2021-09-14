import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Box, BoxProps, Type } from "../slang";
import { Button } from "./Button";
import { Input, Textarea } from "./Input";

const noPaddingBottom = { tablet: { pb: 0 } };
const largeGap = 10;

export default function Feedback() {
  return (
    <Box
      px={4}
      pb={4}
      py={2}
      at={noPaddingBottom}
      gap={largeGap}
      content="start normal"
    >
      <Box gap={largeGap} as="form">
        <Section>
          <Type weight="700">
            <Trans>Feedback</Trans>
          </Type>
          <Type as="p">
            <Trans>
              We appreciate all of your feedback, suggestions, bugs, and feature
              requests!
            </Trans>
          </Type>
        </Section>
        <Section>
          <Type size={-1} weight="700">
            <Trans>What would you like to share with us?</Trans>
          </Type>
          <Textarea name="message" rows={4} />
        </Section>
        <Section>
          <Type size={-1} weight="700">
            <Trans>Email (optional)</Trans>
          </Type>
          <Input name="email" type="email" />
        </Section>
        <Button type="submit" style={{ justifySelf: "start" }}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}

function Section({
  as = "div",
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Box gap={2} as={as} {...props}>
      {children}
    </Box>
  );
}
