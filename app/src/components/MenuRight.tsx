import { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function MenuRight({ children }: { children: ReactNode }) {
  const element = document.getElementById("menu-right");
  return element ? createPortal(children, element) : null;
}
