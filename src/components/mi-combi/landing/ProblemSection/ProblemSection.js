import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./ProblemSection.module.css";

const lines = [
  "Ya no andes preguntando cual pasa.",
  "No te subas al a ver si me deja.",
  "Checa tu ruta antes de salir.",
];

export default function ProblemSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          eyebrow="La bronca"
          title="Moverse en combi no deberia sentirse como adivinar"
          text="Muchas rutas se conocen de boca en boca. Mi Combi junta esos datos para que sean mas faciles de encontrar."
        />
        <div className={styles.lines}>
          {lines.map((line) => (
            <strong key={line}>{line}</strong>
          ))}
        </div>
      </div>
    </section>
  );
}
