import { t } from "@lingui/macro";
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
        text={t`Open Share Link`}
      />
      <Button
        onClick={() => window.flowchartFunDownloadSVG()}
        text={`${t`Download`} SVG`}
      />
      <Button
        onClick={() => window.flowchartFunDownloadPNG()}
        text={`${t`Download`} PNG`}
      />
      <Button
        onClick={() => window.flowchartFunDownloadJPG()}
        text={`${t`Download`} JPG`}
      />
    </Box>
  );
}
