import "./index.css";
import "./slang/slang.css";
import "./pages/post/Post.css";
import "core-js/features/object/from-entries";
import "core-js/features/object/entries";

import { Buffer } from "buffer";
import { createRoot } from "react-dom/client";

import App from "./components/App";
import { initSentry } from "./lib/sentry";
import reportWebVitals from "./reportWebVitals";

// Fixes Webpack 5 Buffer polyfill issue
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}
window.Buffer = Buffer;

initSentry();

const container = document.getElementById("root");
if (!container) throw new Error("No root element");
const root = createRoot(container);

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
