import { routeStatuses } from "@/data/routeStatuses";
import styles from "./StatusPill.module.css";

export default function StatusPill({ status }) {
  const label = routeStatuses[status]?.label || status || "Por confirmar";

  return <span className={`${styles.pill} ${styles[status]}`}>{label}</span>;
}
