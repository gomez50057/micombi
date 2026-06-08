import { popularPlaces } from "@/data/popularPlaces";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import Button from "../../ui/Button/Button";
import styles from "./PopularPlaces.module.css";

export default function PopularPlaces() {
  return (
    <section className="sectionAlt">
      <div className="container">
        <SectionHeader
          eyebrow="Lugares"
          title="Los destinos del día a día"
          text="Estos nombres ayudan a probar busqueda y filtros mientras crece el mapa."
        />
        <div className={styles.tags}>
          {popularPlaces.map((place) => (
            <span key={place}>{place}</span>
          ))}
        </div>
        <div className={styles.actions}>
          <Button href="/rutas" variant="dark">
            Ver mas
          </Button>
        </div>
      </div>
    </section>
  );
}
