import { decompressFromEncodedURIComponent } from "lz-string";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";

import EditorError from "../components/EditorError";
import { EditorWrapper } from "../components/EditorWrapper";
import { EditWrapper } from "../components/EditWrapper";
import Main from "../components/Main";
import { TextEditor } from "../components/TextEditor";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { useDoc } from "../lib/useDoc";

function ReadOnly() {
  const { pathname } = useLocation();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  useQuery(
    ["read", pathname, graphText],
    () => loadReadOnly(pathname, graphText),
    {
      enabled: typeof graphText === "string",
      suspense: true,
      staleTime: 0,
    }
  );

  const text = useDoc((d) => d.text);

  return (
    <EditWrapper>
      <Main>
        <EditorWrapper>
          <TextEditor
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
  const initialText = isCompressed(path)
    ? decompressFromEncodedURIComponent(graphText) ?? ""
    : decodeURIComponent(graphText);
  await prepareChart(initialText, {
    isHosted: false,
    id: "read",
    title: "read-only-flowchart",
  });
  return initialText;
}

function isCompressed(pathname: string) {
  return ["/c/", "/f/", "/n/"].some((p) => pathname.startsWith(p));
}
