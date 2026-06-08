import { manualDrawSteps } from "@/data/tutorials";
import TutorialCard from "../TutorialCard/TutorialCard";
import styles from "./ManualDrawTutorial.module.css";

export default function ManualDrawTutorial() {
  return (
    <TutorialCard
      text="Si no puedes grabar el recorrido, tambien puedes dibujar la ruta desde el mapa de Mi Combi."
      title="Traza la ruta tu mismo en el mapa"
    >
      <ol className={styles.steps}>
        {manualDrawSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className={styles.close}>
        No tiene que quedar perfecto. Con que ayude a ubicar por donde pasa, ya
        sirve.
      </p>
    </TutorialCard>
  );
}
