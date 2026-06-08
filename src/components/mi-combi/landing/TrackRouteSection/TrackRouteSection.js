import Button from "../../ui/Button/Button";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./TrackRouteSection.module.css";

export default function TrackRouteSection() {
  return (
    <section className="sectionAlt">
      <div className="container">
        <div className={styles.panel}>
          <SectionHeader
            eyebrow="Graba"
            title="Graba una ruta gratis con tu celular"
            text="Si vas como pasajero, una app de GPS puede guardar el recorrido mientras haces tu viaje normal."
          />
          <Button href="/tutoriales" variant="dark">
            Ver tutoriales
          </Button>
        </div>
      </div>
    </section>
  );
}
