const TEXT_ENTRY = [
  ".monaco-editor",
  "input",
  "textarea",
  "select",
  '[contenteditable]:not([contenteditable="false"])',
].join(",");

export function isTypingTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(TEXT_ENTRY) !== null;
}
