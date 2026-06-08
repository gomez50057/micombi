import Button from "../../ui/Button/Button";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./DrawRouteSection.module.css";

export default function DrawRouteSection() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.layout}>
          <SectionHeader
            eyebrow="Traza"
            title="Dibuja la ruta tu mismo en el mapa"
            text="Marca puntos por donde pasa la combi, revisa las coordenadas y descarga el archivo."
          />
          <Button href="/trazar-ruta" variant="secondary">
            Trazar ahora
          </Button>
        </div>
      </div>
    </section>
  );
}
