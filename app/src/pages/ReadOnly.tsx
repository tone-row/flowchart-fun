import { OnMount } from "@monaco-editor/react";
import { decompressFromEncodedURIComponent } from "lz-string";
import { useRef } from "react";
import { useQuery } from "react-query";
import { useParams, useRouteMatch } from "react-router-dom";

import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Main from "../components/Main";
import { TextEditor } from "../components/TextEditor";
import { prepareChart, useDoc } from "../lib/prepareChart";

function ReadOnly() {
  const { path } = useRouteMatch();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  useQuery(["read", path, graphText], () => loadReadOnly(path, graphText), {
    enabled: typeof graphText === "string",
    suspense: true,
    staleTime: 0,
  });

  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const text = useDoc((d) => d.text);

  return (
    <EditWrapper>
      <Main>
        <EditorWrapper>
          <TextEditor
            editorRef={editorRef}
            value={text}
            extendOptions={{
              readOnly: true,
            }}
          />
        </EditorWrapper>
        <EditorError />
      </Main>
    </EditWrapper>
  );
}

export default ReadOnly;

async function loadReadOnly(path: string, graphText: string) {
  const isCompressed = [
    "/c/:graphText?",
    "/f/:graphText?",
    "/n/:graphText?",
  ].includes(path);
  const initialText = isCompressed
    ? decompressFromEncodedURIComponent(graphText) ?? ""
    : decodeURIComponent(graphText);
  prepareChart(initialText, {
    isHosted: false,
    id: "read",
    title: "read-only-flowchart",
  });
  return initialText;
}
