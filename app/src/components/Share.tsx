import { Trans } from "@lingui/macro";
import { useContext } from "react";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import { Button } from "./Shared";

export default function Share() {
  const { shareLink } = useContext(AppContext);
  return (
    <Box gap={2} content="start stretch" p={4}>
      <Button
        as="a"
        href={`${new URL(window.location.href).origin}/c#${shareLink}`}
        rel="noreferrer"
        target="_blank"
      >
        <Trans>Open Share Link</Trans>
      </Button>
      <Button onClick={() => window.flowchartFunDownloadSVG()}>
        <Trans>Download</Trans> SVG
      </Button>
      <Button onClick={() => window.flowchartFunDownloadPNG()}>
        <Trans>Download</Trans> PNG
      </Button>
      <Button onClick={() => window.flowchartFunDownloadJPG()}>
        <Trans>Download</Trans> JPG
      </Button>
    </Box>
  );
}
