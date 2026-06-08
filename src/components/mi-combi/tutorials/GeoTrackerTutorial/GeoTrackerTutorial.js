import { geoTrackerSteps } from "@/data/tutorials";
import TutorialCard from "../TutorialCard/TutorialCard";
import styles from "./GeoTrackerTutorial.module.css";

export default function GeoTrackerTutorial() {
  return (
    <TutorialCard
      text="Si te sabes una combi, puedes grabar el recorrido desde tu celular y mandarlo para ayudar a completar el mapa."
      title="Graba una ruta gratis con tu celular"
    >
      <strong className={styles.tool}>Herramienta recomendada: Geo Tracker</strong>
      <ol className={styles.steps}>
        {geoTrackerSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className={styles.warning}>
        No grabes mientras manejas. Si vas como pasajero, guarda el celular y
        deja que la app grabe sola.
      </p>
      <p className={styles.close}>
        Tu viaje puede ayudar a que alguien mas no se pierda.
      </p>
    </TutorialCard>
  );
}
