import InfoCard from "../../ui/InfoCard/InfoCard";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./CommunitySection.module.css";

const cards = [
  {
    title: "Usuarios de diario",
    text: "La banda que se sube todos los dias sabe mejor que nadie por donde pasa la combi.",
  },
  {
    title: "Aportes ciudadanos",
    text: "Puedes mandar una ruta escrita, un recorrido grabado o una correccion.",
  },
  {
    title: "Rutas mas claras",
    text: "Entre mas personas aporten, mas facil sera moverse sin perderse.",
  },
  {
    title: "Sin fines de lucro",
    text: "Mi Combi es un proyecto independiente y personal, hecho para ayudar a la comunidad.",
  },
];

export default function CommunitySection() {
  return (
    <section className="sectionAlt">
      <div className="container">
        <SectionHeader
          eyebrow="Comunidad"
          title="La comunidad mueve el mapa"
          text="Mi Combi crece con la gente que usa las rutas todos los dias: estudiantes, trabajadores, vecinos y usuarios que pasan datos reales."
        />
        <div className={styles.grid}>
          {cards.map((card, index) => (
            <InfoCard
              key={card.title}
              marker={index + 1}
              text={card.text}
              title={card.title}
            />
          ))}
        </div>
        <p className={styles.close}>No te guardes el dato. Si sabes la ruta, pasala.</p>
      </div>
    </section>
  );
}
