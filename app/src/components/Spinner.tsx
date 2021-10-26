import { CSSProperties } from "react";
import style from "./Spinner.module.css";

export default function Spinner({
  className = "",
  r = 16,
  s = 1.15,
  c = "var(--color-foreground)",
}: {
  className?: string;
  r?: number;
  s?: number;
  c?: string;
}) {
  const d = Math.PI * r;

  return (
    <svg
      width={2 * (r + s)}
      height={2 * (r + s)}
      className={[style.Spinner, className].join(" ")}
      style={{ "--d": 2 * d, "--c": c } as CSSProperties}
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
