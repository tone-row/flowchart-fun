import style from "./Spinner.module.css";
export default function Spinner() {
  return (
    <svg width={40} height={40} className={style.Spinner}>
      <circle
        r={17}
        strokeWidth={1}
        fill="transparent"
        cx={20}
        cy={20}
        stroke="var(--color)"
        strokeDasharray={53.407}
        strokeDashoffset={53.407}
      />
    </svg>
  );
}
