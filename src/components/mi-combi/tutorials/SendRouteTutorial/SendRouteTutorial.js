import { helpfulRouteData, sendRouteOptions } from "@/data/tutorials";
import TutorialCard from "../TutorialCard/TutorialCard";
import styles from "./SendRouteTutorial.module.css";

export default function SendRouteTutorial() {
  return (
    <TutorialCard
      text="Cuando tengas tu archivo, puedes enviarlo para que lo revisemos antes de publicarlo en el mapa."
      title="Manda tu ruta"
    >
      <div className={styles.columns}>
        <div>
          <h3>Opciones</h3>
          <ol>
            {sendRouteOptions.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Datos que ayudan</h3>
          <ul>
            {helpfulRouteData.map((data) => (
              <li key={data}>{data}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className={styles.message}>
        Gracias por pasar el dato. Revisaremos tu aporte antes de publicarlo.
      </p>
    </TutorialCard>
  );
}
