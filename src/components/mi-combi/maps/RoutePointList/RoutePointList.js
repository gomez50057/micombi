import styles from "./RoutePointList.module.css";

export default function RoutePointList({ points }) {
  return (
    <div className={styles.panel}>
      <h3>Puntos marcados</h3>
      {points.length === 0 ? (
        <p>Toca el mapa para agregar el primer punto.</p>
      ) : (
        <ol>
          {points.map((point) => (
            <li key={point.id}>
              <span>{point.order}</span>
              <code>
                {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
              </code>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
