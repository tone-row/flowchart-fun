import "./Docs.css";

import { useEffect, useRef, useState } from "react";

import { useDocs } from "../lib/queries";

export default function Docs({ currentText }: { currentText: string }) {
  const { data } = useDocs();
  const help = useRef<HTMLDivElement>(null);

  // Add View Example Button
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

  // Build Table of Contents
  const [contents, setContents] = useState<[string, string[]][]>([]);
  useEffect(() => {
    const contents: [string, string[]][] = [];
    const main = document.querySelector(".flowchartFunHelp main");
    if (!main) return;
    main.childNodes.forEach((el) => {
      if (!el) return;
      const textContent = el.textContent ?? "";
      if (!textContent) return;
      if (el.nodeName === "H2") {
        contents.push([textContent, []]);
      } else if (el.nodeName === "H3") {
        contents[contents.length - 1][1].push(textContent);
      }
    });
    setContents(contents);
  }, [data]);

  // Set codesample as current location
  useEffect(() => {
    if (data && help.current) {
      help.current.querySelectorAll(".code-sample code").forEach((el) => {
        const text = el.textContent ?? "";
        const parent = el.parentNode;
        if (!parent) return;
        if (text === currentText) {
          (parent as Element).setAttribute("aria-current", "location");
          return;
        }
        (parent as Element).removeAttribute("aria-current");
      });
    }
  }, [currentText, data]);

  return (
    <div className="flowchartFunHelp">
      <header>
        <details>
          <summary>Table of Contents</summary>
          <ul className="sections">
            {contents.map(([title, children]) => (
              <li key={title} className="section">
                <a
                  href={`#${title.toLowerCase().replace(/ /g, "-")}`}
                  className="section-title"
                >
                  {title}
                </a>
                {children.length > 0 && (
                  <ul>
                    {children.map((child) => (
                      <li key={child}>
                        <a
                          href={`#${child.toLowerCase().replace(/ /g, "-")}`}
                          className="subsection-title"
                        >
                          {child}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </details>
      </header>
      <main ref={help} dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
