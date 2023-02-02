import { OnMount } from "@monaco-editor/react";
import { Resizable } from "re-resizable";
import { Suspense, useCallback, useEffect, useRef } from "react";
import { useQuery } from "react-query";

import Docs from "../components/Docs";
import EditorError from "../components/EditorError";
import { EditWrapper } from "../components/EditWrapper";
import Loading from "../components/Loading";
import Main from "../components/Main";
import { TextEditor } from "../components/TextEditor";
import { titleToLocalStorageKey } from "../lib/helpers";
import { prepareChart, useDoc } from "../lib/useDoc";
import helpStyles from "./Help.module.css";

export default function Help() {
  useQuery("loadHelpText", loadHelpText, { suspense: true, staleTime: 0 });

  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);

  useEffect(() => {
    window.flowchartFunSetHelpText = (text: string) =>
      useDoc.setState({ text });
    return () => {
      delete window.flowchartFunSetHelpText;
    };
  }, []);

  const onChange = useCallback(
    (value) => useDoc.setState({ text: value ?? "" }),
    []
  );
  const text = useDoc((s) => s.text);

  return (
    <EditWrapper>
      <Main>
        <div className={helpStyles.helpWrapper} data-testid="help">
          <Resizable
            defaultSize={{ width: "100%", height: "50vh" }}
            className={helpStyles.resizable}
            enable={{
              top: false,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
          >
            <div className={helpStyles.docsWrapper}>
              <div className={helpStyles.docsWrapperScroll}>
                <Suspense fallback={<Loading />}>
                  <Docs currentText={text} />
                </Suspense>
              </div>
            </div>
          </Resizable>
          <TextEditor editorRef={editorRef} value={text} onChange={onChange} />
        </div>
        <EditorError />
      </Main>
    </EditWrapper>
  );
}

declare global {
  interface Window {
    flowchartFunSetHelpText?: (text: string) => void;
  }
}

async function loadHelpText() {
  let workspaceText = localStorage.getItem(titleToLocalStorageKey("h"));
  if (!workspaceText) {
    // TODO: get default text
    workspaceText = " ";
  }

  prepareChart(workspaceText, {
    id: "h",
    title: "h",
    isHosted: false,
  });
  return workspaceText;
}
