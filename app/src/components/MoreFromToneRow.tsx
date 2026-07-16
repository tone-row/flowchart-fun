import { Trans } from "@lingui/macro";
import { Fragment } from "react";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

import { TONE_ROW_URL, toneRowProjects } from "../lib/toneRowProjects";

const linkClasses =
  "hover:text-blue-600 dark:hover:text-blue-400 transition-colors";

/**
 * A discreet credit line for the sandbox homepage, shown in the tab row
 * above the graph canvas on desktop. On mobile it stays in the DOM but
 * hidden (like the rest of the desktop nav), which is enough for crawlers
 * to follow the outbound links; the visible mobile placement is the links
 * in the mobile menu (Header.tsx).
 */
export function MoreFromToneRow({ className }: { className?: string }) {
  const { pathname } = useLocation();
  if (pathname !== "/") return null;
  return (
    <div
      className={classNames(
        "text-right text-[11px] leading-tight text-gray-500/60 dark:text-gray-400/60 whitespace-nowrap",
        className
      )}
    >
      <Trans>
        Made by{" "}
        <a href={TONE_ROW_URL} className={linkClasses}>
          Tone&nbsp;Row
        </a>
      </Trans>
      {" · "}
      <Trans>More tools:</Trans>{" "}
      {toneRowProjects.map((project, i) => (
        <Fragment key={project.name}>
          {i > 0 && " · "}
          <a href={project.href} className={linkClasses}>
            {project.name}
          </a>
        </Fragment>
      ))}
    </div>
  );
}
