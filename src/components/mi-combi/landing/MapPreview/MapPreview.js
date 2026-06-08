import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import Button from "../../ui/Button/Button";
import styles from "./MapPreview.module.css";

export default function MapPreview() {
  return (
    <section className="sectionAlt">
      <div className="container">
        <div className={styles.layout}>
          <div>
            <SectionHeader
              eyebrow="Mapa"
              title="Ve por donde va antes de subirte"
              text="Las rutas se muestran como trazos para ubicar calles, puntos conocidos y municipios."
            />
            <Button href="/mapa">Abrir mapa</Button>
          </div>
          <div className={styles.preview}>
            <span className={styles.streetOne} />
            <span className={styles.streetTwo} />
            <span className={styles.routeLine} />
            <span className={styles.pointA}>Centro</span>
            <span className={styles.pointB}>Plaza Q</span>
            <span className={styles.pointC}>Providencia</span>
          </div>
        </div>
      </div>
    </section>
  );
}
