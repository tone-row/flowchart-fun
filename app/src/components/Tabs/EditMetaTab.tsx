import { Trans } from "@lingui/macro";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

import { editorOptions } from "../../lib/constants";
import { useLightOrDarkMode } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import { Button } from "../../ui/Shared";

export function EditMetaTab() {
  const meta = useDoc((s) => s.meta);
  const [localMeta, setLocalMeta] = useState(JSON.stringify(meta, null, 2));
  // try to parse when changed and only allow saving if valid
  const [parsed, setParsed] = useState<false | Record<string, unknown>>(meta);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localMeta);
      setParsed(parsed);
    } catch (e) {
      setParsed(false);
    }
  }, [localMeta]);
  const mode = useLightOrDarkMode();
  return (
    <div
      style={{
        height: "100%",
        position: "relative",
      }}
    >
      <Editor
        value={localMeta}
        onChange={(value) => {
          if (value) {
            setLocalMeta(value);
          }
        }}
        language="json"
        theme={mode === "dark" ? "vs-dark" : "vs-light"}
        options={editorOptions}
      />
      {localMeta !== JSON.stringify(meta, null, 2) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Button
            onClick={() => {
              setLocalMeta(JSON.stringify(meta, null, 2));
            }}
          >
            <Trans>Discard</Trans>
          </Button>
          <Button
            disabled={parsed === false}
            onClick={() => {
              try {
                if (!parsed) return;
                useDoc.setState({ meta: parsed }, false, "EditMetaTab/meta");
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <Trans>Save</Trans>
          </Button>
        </div>
      )}
    </div>
  );
}
