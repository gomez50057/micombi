import { validationLabels } from "@/lib/validationLabels";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./ValidationInfo.module.css";

export default function ValidationInfo() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Ojo"
          title="Datos claros, sin vender humo"
          text="Mi Combi muestra cuando un dato esta revisado, por confirmar o en construccion."
        />
        <ul className={styles.list}>
          {validationLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
