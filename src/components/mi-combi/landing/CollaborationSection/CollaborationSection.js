import { communityActions, contributionStates } from "@/data/communityActions";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./CollaborationSection.module.css";

export default function CollaborationSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Colaboracion"
          title="Del dato suelto al mapa"
          text="Cada aporte queda como recibido, se revisa y puede convertirse en un trazo preliminar antes de publicarse."
        />
        <ol className={styles.flow}>
          {communityActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>
        <div className={styles.states}>
          {contributionStates.map((state) => (
            <span key={state}>{state}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
