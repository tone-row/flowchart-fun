import { EditorProps } from "@monaco-editor/react";
import cytoscape from "cytoscape";

import { GraphThemes } from "./graphThemes";

type AllKeys<T> = T extends any ? keyof T : never;
type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any }
  ? T[K]
  : undefined;
type Merge<T extends object> = {
  [k in AllKeys<T>]: PickType<T, k>;
};

type Layout = Merge<cytoscape.LayoutOptions> & {
  elk?: any;
  rankDir?: string;
};

export type GraphOptionsObject = {
  layout: Partial<Layout>;
  style?: cytoscape.Stylesheet[];
  theme?: GraphThemes;
  background?: string;
};

export const editorStyleOptions: EditorProps["options"] = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 16,
  lineHeight: 32,
  tabSize: 2,
  insertSpaces: true,
  lineDecorationsWidth: "10px",
  cursorWidth: 2,
  padding: { top: 10, bottom: 10 },
};

export const editorFunctionalOptions: EditorProps["options"] = {
  minimap: { enabled: false },
  wordBasedSuggestions: false,
  occurrencesHighlight: false,
  renderLineHighlight: "none",
  // scrollBeyondLastLine: false,
  overviewRulerBorder: false,
  renderValidationDecorations: "on",
  roundedSelection: false,
  colorDecorators: false,
  hideCursorInOverviewRuler: true,
  matchBrackets: "never",
  selectionHighlight: false,
  lineNumbersMinChars: 3,
  automaticLayout: true,
  lineNumbers: "off",
  contextmenu: false,
};

// Combine both options for use in the editor
export const editorOptions: EditorProps["options"] = {
  ...editorStyleOptions,
  ...editorFunctionalOptions,
};

export const delimiters = "~~~";
export const newDelimiters = "=====";

export const LOCAL_STORAGE_SETTINGS_KEY = "flowcharts.fun.user.settings";
export const SANDBOX_STORAGE_KEY = "flowcharts.fun.sandbox";

export const HIDDEN_GRAPH_OPTIONS_DIVIDER = "¼▓╬";

// The raster image scale for a valid user
export const AUTH_IMG_SCALE = 3;
// default unauth raster image scale
export const UNAUTH_IMG_SCALE = 1.5;

// This is to avoid a monaco-editor import that breaks too many things
export const monacoMarkerErrorSeverity = 8;

export const DISCORD_URL = "https://discord.gg/wPASTQHQBf";

// Base64 encoded watermark image
export const WATERMARK_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAdwAAABgCAYAAAC33MNPAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA7mSURBVHgB7Z3rkRU3E4Znv/r+244AE4HtCGxHYBMBEAEQARABEAEQwUIEQAQLEQARABEcn3ermmp6JY3mppmz8zxVU+yyc9Vo9ErdUvfZ4UgHAAAAi/K/DgAAABYHwQUAAGgAggsAANAABBcAAKABCC4AAEADEFwAAIAGILgAAAANQHABAAAagOACAAA0AMEFAABoAIILAADQAAQXAACgAQguAABAAxBcAACABiC4AAAADUBwAQAAGoDgAgAANADBBQAAaACCCwAA0IDZBffs7OwktsePH3cAAACtYIQLAADQAAQXAACgAf/voBlfv379YZuTT58+/fD758+fr1zz559/7p4/f94BAEB7ENwFkPi9ffu2+/Dhw+XP79+/vyKIa4DYAgCsB4I7ExLY169fdy9evJh99DoXf/31VwcAAOuA4E5Awvrs2bPu6dOnmxVZ486dO92vv/7aAQDAOiC4I5HQPnr0qCi08plqM3Jm5SFCONY0ffv27Q4AANYDwR2IBO/u3buXJmRDovr77793//zzz6V46ucoojru5s2byXPKtzrG3Ktz2oQo+YnfvXvXvXr16sp+updTMSfrmWSajx2Z3377rfv333+v7K/n1v7Gn3/+iel8Q5gVyLhx48altQW2jc1Bid/hvXv3fhhEwEAOM6NTnsJ2HJ0ehnL0zx6Ole37OY4N++HJkyeHL1++9B775s2b7L18/PjxMBcXFxdXzn8U9MMpcP/+/WwZHRvp5DF6tqnvFZZDddu/H30zsF3Ufhw76E3aqj3COtxKFJlKPXO/vOYoot1RJKp6fN++fcv+bU7fqkbXuidD95YaGW4Nla984QCwDrIu3bp1axMrKq4rmzEpS8xkDmyFhKkWiYH8tXbc+fn5YJGU6TPFEhOZfAdAYrt1E5A+cCtfkSqTn376qQOA5VA758WWSZbzsxnBld9tixN7bHKUkNhqVDtGwHKTq5au1A8fPuy2jveHi7E+bYBTx4ue2hv5TFvhBwVql47m4w7mhUlTBVTxzTyrCqiR7djRYs5Ms8To0z4cfayn0Eu1qFgAe0edT+uAqtO5luDCMuDDzaAR6d9///39d40Up4jXHEuCapGI635PxSeKzwgA9gAj3AwyJZsQSBSnLmVoKbiEcAQA2B6McBPESTxz+BNzPlytSwQAgOsPgpsgJqdXQIsplHwjLCIHANgHmJQTxFmzU0WxFP5xyPIkaINF7pKlw8Jz6j3tqXOkZ7dNyPVh5TA3Km/LqrVUebd8nrFYGcA8WHmqfm3lfSO4AYUJnHsST+l8exzhyj/uQ1DGRubBgwdXykVm/SWXOFkIQj9LNGJBRWqXr1kYUEPzANY4VjNda4KfWBko41VpzoG9i6nzD1JhUj165inXWfp5VG9VV41YRy1MqU/P6d+j7k+BJuxnC9Xqz+8nbhqaozHH3I/UuY04abR0bf8cQt/JkydPulpie6Bj+4SxdEwpzr3uXX9bbQnqYWa6kaEWFTZxCyiE4Nz3pnCDqWc+VpDDHkmVcd+2ZGhHhd30ITv7NoW+0zF9KOSnP+4oeodanj59OjokYiwTheurud7QMjg/P+89by60o+6p9npjvr+h73RM3YnhWn0dzYUp9deIZVO7zRVeca5rTw3fGduDmm8rd0xt26K2tyYk79zgww2kTDpTzTwt1+DCMOSvV09+SHpFvU8dE339Eb1fP+EuN5JLEZNQmGmsBp/MwZJplNBzaOQ+tAw0qnn58mU3FCu/2utpVDik7HRPQ9+p0Min753WoFE7YUrbo3cna0YN+p78qLwVmJQDLQV3r6HTYghPNaa+jFLhKJcI+6mP089GFxInmZsklHYP5tONoe90bC6LkaHzmFjYefoEUPtFgbFja2bM+/paY5qLZaB6KTN0TRlIqFUGQ0Ol6nw6vyYk2nUs85UEMzacahwV+aivk6p7i0v4zNTr/cLaT2U85p32PVtto6978feqZ/cdrVyWr7k66rGc/H3nYrBvdZBgK0usTNVeWJ0033181/b+W0bj24zgqqLN7Ts19FHXNAi56+vFWNKCMawV1nGr6IPwH7tGBP5jt8Z+SfSuvf9N6MOL4mOo/uie4yhI9+6FKRI7Ckqh2FcXtU8KjVz7ysX7C0Vphr2PpGao7HOjMysDbTayVd1WOSrkaQ26P31P8gXm1rbrGVVu3g9t/ti+xjG+09x1bG19fB6h9ztGcFWeVo91vHUmPL6eWBIUf3wU3CXX1MdzR8E9pfX8eu+50LvWzuqdyPLhO6Sq601TDh5mphvhF1h6q/UBlVLoTUn7lvMlbcVvvTZjfDjGWB9uvOaxIT/Uon27jO8uhX//NX5cf2/+WP3cRyyPkr9vShnIT2fHyZ+b84el/JRKaVlDnPtQ4xvUfaiMtX9tWkodE7/RGj9pqr1QWYz1sa6dyjA+Ry1b8OGW6qAn9a6HtDdTwYdbyVifjJnJUhD0Yh38SETYzMVatK8fuehcJX/hUD+u38fP9kyZmiPRf5uzokwtA5vVq1FQjanXXyeOqnPEOMJmaSqh+1DMc2210eGiaVfkrAx9aIS1V8vVmqg+1tTB1Lv238zSILgVTDGvsCRoe0TRGuPDiSbH0uQhL7i2/KN0b/Z3axx8A94nBN5cVjI/xzIYasLX/hLaWlEzhohRat1k7USooSbh1FKXoeiaiO06DCn3WNfHvOuxILiO1EvTR69e69hJFKWXOfbjtAXd8vfIryX/BYmj64niOGYxfPSNxlnFpX1LPWr/N2sYfN0rjXCH+G+jcG8xNaaI72apOh7zLY9phOlAnwaaFOdp2W4yS9mRcrbLNDUlOsmHDx+yf/vjjz+6IZQqxlyL4fdAnHU+5v3Gsi7NZLcoN9aIl/b1gmqCqX/NpVGawBfPWxq1xn0RC4DlQXAdanTUOErY9O8c/phST3mOnpWZu8eOwPdGyac+x3lzwqX3Yz5TjYZTLopPIbSfCaYtZ7H71gg9lSc1jo5LIhrr3h4Et/Tuv3371gEsDSblgBqqucRWLGmusPtEbOtZ0l9TOrdfHpTz4/rRrUTW6l/0ZebMykPW37b0W62FyknuFlmSfvnll8vt5s2bya12IhfAFBDcgHxZc840XEJwLcH8xcUFyQ9OhNgpSvlxU/7b1PEpwf3kAvOLqRmuThmLZKVNpvghUboAlgSTcmDugAs5wbVoKCnUOORMXBZBBZ/baWGjVBuFpvy4Kf+t/91GYbY8qLTcaOnAIVvFAv5HgbUsRLmOtEXSAlgSBHdhcoKrBhRT8L6QCFqjHgXSrzGNMZiFram1+hSjTvlZxzVi633C1wnN1vfPZZlr+jqp8q/7yFYAS4BJeUFKDRoj1HWwGcNLnbuEH7VGE3CNYJbMyn50VtORu471L6bhszkOfRPIAFqxGcHVx3I4HBbZ1lpjWDJR0QCsxxxrO+MxNaPKOMryIlsyJ6f+3/slozm0JtFDq/WtLYl+cY1s+c7ag788DyPcBSktNWCy03pEcRwTxi+ur655n7nZxjFkY068o2CbwPj7T0VnSjFHGWytYd3jUqctEC0716HzthQI7oKQB3ebxBFgbTq10jGpdbEpUhOdvNj55UCRnGDXiHUkjqJrYjxHtORGfs+tNLBTOgCsw52Gr7N94UsjexJoBHdBchWJ0e26SJSi8A0RHImtD+Voa7dr8GKv+hFzoPYJpvfP2nHenFy7HCjmWtXzK0xoLbq2ykGbZgWPEey5GRt3WVyXhPGWxlAdIXWIWolZLPtSbHGP5SXeCwjugjDC3S4xYYFmt9Zm8knlXK0lTuCRWbjGf2v4+Qhmih4zwhWxDJQtqGZpjK7nZ/RaZLa1iY1+bQciJiY/ZfRetHxMHSF1IhTUo4WgxXpXU5dsvfSeQHAXhBFue/SR28irlDZPDYSPLqT99PGrwcqtkdXf4hpPS1M3hJjaz+pJHHWmiGZliYVhS4eG3EcsA0VlalEGS5Ayk5eSeujvehaJg0+DKHw9auWrjh1xS6Hot5J4RmuJUTvanII6gvH+VZdSnRn9rv+3WPK7Wh55mJlu4STxp4ISHeeetWXC41NgSgL6i4uLYr3qSwZ+bCiSxylJtZJaa4sJq23TsWM4jjyS5+tLZG8cRXLS8RGfTH7uMmidnDxXNsdOyuW1teln/zyWbD1XDrlrxgT0Y8vfo3sp1edS+cWyHnpfXUjoPpTz8/PsfVtdivXoaB2aJQH9kDZjap2cAiPchSiZUxjhzofKckoPWaOGVD5cm/hhftaIjhkz2UrkzMY1y3lKx48N56i1qqlYwn1loIliY8tgKTRSTS0D1Pdo5ne/pMrW6ooxeZHnpnby3RBaubD0HebK0OqSr0d61qH5lE8dBHchcjlPWYQ/P/KhSjDGmjVlUqxNpq73pxjWOmYsOdNvbcchV4emdOQkVHquGh+w9pFIbXWikToBNekq7TlsP/2udJxD/OBzo3qsex+bMjJ170uIeA59F32x6FV3Vd+uy0S1IZxpmNvNyNnZWTcGfSRbTYI9Bk1WSPmO9DHtrVd3SliKPK2z9aEWlbR6L52lXBncuHHjslNwSmVgI1ot+7HJXaf4HENQW6p3p+eT1WMti5pZFXzZ7+k7SoHgLoBNxoiowmkkBQAA+wOT8gLkZgUOWT4CAADXCwR3Zmw5QURiu6ZvCAAA1oX0fDMiP4XW/XlkRtZEDGYmAwDsG0a4M6HJJX6RvSYFaIq8Zn4itgAAwAh3IBJWRUmx2Y4SVm0+Oo9mIW8l+g4AAGwDBHcAFvuzL+6qwqtZCDYTXRNm24TWx7EmFwBgHyC4ldSKrdAo2NYv5vbXCBixBQDYD/hwKxgitjVIbKdEKgIAgNMDwe1BfllltUBsAQBgCrOblMcGd6gN3N4amX21rEd4U/Hnz5+/72Ni7P+eMisrfmgqSDwAAFx/Zg/tCAAAAFfBpAwAANAABBcAAKABCC4AAEADEFwAAIAGILgAAAANQHABAAAagOACAAA0AMEFAABoAIILAADQAAQXAACgAQguAABAAxBcAACABiC4AAAADUBwAQAAGoDgAgAANADBBQAAaACCCwAA0AAEFwAAoAEILgAAQAP+A8O+ngJ+l2ujAAAAAElFTkSuQmCC";

// Original dimensions of the watermark image
export const WATERMARK_ORIGINAL_WIDTH = 476; // Actual width in pixels
export const WATERMARK_ORIGINAL_HEIGHT = 96; // Actual height in pixels

// Watermark sizing relative to exported image
export const WATERMARK_WIDTH_PERCENTAGE = 0.15; // 15% of the image width
export const WATERMARK_MARGIN = 10; // pixels from the edge
