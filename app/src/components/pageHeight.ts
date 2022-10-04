import throttle from "lodash.throttle";

function writePageHeight() {
  document.documentElement.style.setProperty(
    "--page-height",
    `${window.innerHeight - 1}px`
  );
}

const throttleWrite = throttle(writePageHeight, 100, { trailing: true });

export function pageHeight() {
  writePageHeight();
  window.addEventListener("resize", throttleWrite);
}
