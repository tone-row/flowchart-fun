import { useProcessStyleStore } from "../lib/preprocessCytoscapeStyle";
import styles from "./TextResizer.module.css";

export default function TextResizer() {
  const fontData = useProcessStyleStore((s) => s.fontData);
  return <div id="resizer" className={styles.TextResizer} style={fontData} />;
}
