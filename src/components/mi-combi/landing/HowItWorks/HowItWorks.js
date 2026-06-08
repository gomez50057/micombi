import InfoCard from "../../ui/InfoCard/InfoCard";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import Button from "../../ui/Button/Button";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    title: "Busca",
    text: "Pon tu destino, colonia o referencia y revisa si ya hay una ruta cargada.",
  },
  {
    title: "Checa",
    text: "Ve por donde pasa, el estado del dato y si el trazo esta validado o por confirmar.",
  },
  {
    title: "Aporta",
    text: "Si sabes algo que falta, mandalo. La ruta la armamos entre todos.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Asi funciona"
          title="En segundos sabes por donde moverte"
          text="Claro, directo y pensado para usarlo desde el celular."
        />
        <div className={styles.grid}>
          {steps.map((step, index) => (
            <InfoCard
              key={step.title}
              marker={index + 1}
              text={step.text}
              title={step.title}
            />
          ))}
        </div>
        <div className={styles.actions}>
          <Button href="/contribuye" variant="dark">
            Ver mas
          </Button>
          <Button href="/tutoriales" variant="ghost">
            Ver tutoriales
          </Button>
        </div>
      </div>
    </section>
  );
}
