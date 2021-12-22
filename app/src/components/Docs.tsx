import "./Docs.css";

import { useEffect, useRef } from "react";

import { useDocs } from "../lib/queries";

export default function Docs() {
  const { data } = useDocs();
  const help = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (data && help.current) {
      help.current.querySelectorAll(".code-sample code").forEach((el) => {
        const button = document.createElement("button");
        const text = el.textContent ?? "";
        button.addEventListener(
          "click",
          () =>
            window.flowchartFunSetHelpText &&
            window.flowchartFunSetHelpText(text)
        );
        button.classList.add("code-example-link");
        button.innerText = "View Example";
        if (el.parentNode) el.parentNode.appendChild(button);
      });
      return () =>
        document
          .querySelectorAll(".code-example-link")
          .forEach((el) => el.remove());
    }
  }, [data]);
  return (
    <div
      ref={help}
      className="help"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
}
