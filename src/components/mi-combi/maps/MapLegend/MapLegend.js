import { routeStatuses } from "@/data/routeStatuses";
import styles from "./MapLegend.module.css";

export default function MapLegend() {
  return (
    <aside className={styles.legend}>
      <h3>Estados (solo combis)</h3>
      {Object.entries(routeStatuses).map(([key, status]) => (
        <div className={styles.item} key={key}>
          <span className={`${styles.dot} ${styles[key]}`} />
          <div>
            <strong>{status.label}</strong>
            <p>{status.description}</p>
          </div>
        </div>
      ))}
    </aside>
  );
}
