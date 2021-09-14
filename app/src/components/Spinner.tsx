import { CSSProperties } from "react";
import style from "./Spinner.module.css";
const r = 20;
const s = 3;
const d = Math.PI * r;
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      width={2 * (r + s)}
      height={2 * (r + s)}
      className={[style.Spinner, className].join(" ")}
      style={{ "--d": 2 * d } as CSSProperties}
    >
      <circle
        r={r}
        strokeWidth={s}
        fill="transparent"
        cx={r + s}
        cy={r + s}
        strokeDasharray={d}
        strokeDashoffset={d}
      />
    </svg>
  );
}
