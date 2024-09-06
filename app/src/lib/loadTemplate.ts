import { useEffect } from "react";
import type { FFTheme } from "./FFTheme";
import { prepareChart } from "./prepareChart/prepareChart";
import { templates } from "shared";
import { useDoc } from "./useDoc";
import { mountGraph, unmountGraph } from "./useUnmountStore";

/**
 * Loads a template given a template key
 */
export async function loadTemplate(
  template: typeof templates[number] | null,
  /** Whether to replace the content or not */
  replaceContent: boolean,
  /**
   * Callback function
   */
  callback?: () => void
) {
  if (!template) return;

  if (!templates.includes(template)) return;

  const importTemplate = await import(
    `../lib/templates/${template}-template.ts`
  );
  const templateContent = importTemplate.content;
  const theme: FFTheme = importTemplate.theme;
  const cytoscapeStyle: string = importTemplate.cytoscapeStyle ?? "";

  const { text, meta: _meta, details } = useDoc.getState();

  const nextContent = replaceContent ? templateContent : text;

  const meta = {
    ..._meta,
    cytoscapeStyle,
    themeEditor: theme,
    // Unfreeze the doc
    nodePositions: undefined,
    customCssOnly: false,
  };

  callback?.();

  unmountGraph();
  // The reason this is done is because the unmounting
  // of the graph happens effectually, i.e. not immediately
  // and when an elk layout is run, but the graph is no longer
  // there we get an error, this ensures the graph is actually
  // unmounted, therefore the layout doesn't begin to run
  requestAnimationFrame(() => {
    prepareChart({
      doc: `${nextContent}\n=====${JSON.stringify(meta)}=====`,
      details,
    });
    mountGraph();
  });
}

declare global {
  interface Window {
    __load_template__: typeof loadTemplate;
  }
}

/**
 * A hook to ensure loadTemplate is available on the window
 */
export function useEnsureLoadTemplate() {
  useEffect(() => {
    window.__load_template__ = loadTemplate;
  }, []);
}
