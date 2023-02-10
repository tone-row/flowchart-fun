import { LogSnag } from "logsnag";

const token = process.env.REACT_APP_LOGSNAG_TOKEN;
if (!token) throw new Error("LogSnag token not found!");

const logsnag = new LogSnag({
  token,
  project: "flowchart-fun",
});

// write a fuction that wraps other funnctions and returns a noop if not in production
const prodOnly = (fn: Function) => {
  if (process.env.NODE_ENV === "production") {
    return fn;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }
};

export const track_downloadPng = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Download PNG",
    icon: "🖼",
    notify: true,
  });
});

export const track_downloadSvg = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Download SVG",
    icon: "🖼",
    notify: true,
  });
});

export const track_downloadJPG = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Download JPG",
    icon: "🖼",
    notify: true,
  });
});

export const track_copyFullscreenShareLink = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Copy Fullscreen Share Link",
    icon: "🔗",
    notify: true,
  });
});

export const track_copyEditableShareLink = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Copy Editable Share Link",
    icon: "🔗",
    notify: true,
  });
});

export const track_copyReadOnlyShareLink = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Copy Read Only Share Link",
    icon: "🔗",
    notify: true,
  });
});

export const track_copyMermaidJsCode = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Copy Mermaid JS Code",
    icon: "💻",
    notify: true,
  });
});

export const track_copyPublicLink = prodOnly(() => {
  logsnag.publish({
    channel: "export",
    event: "Copy Public Link",
    icon: "🔗",
    notify: true,
  });
});
