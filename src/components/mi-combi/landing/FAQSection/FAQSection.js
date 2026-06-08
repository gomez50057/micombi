import { faqs } from "@/data/faqs";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./FAQSection.module.css";

export default function FAQSection() {
  return (
    <section className="sectionAlt">
      <div className="container">
        <SectionHeader
          center
          eyebrow="Preguntas"
          title="Lo basico antes de usar Mi Combi"
        />
        <div className={styles.grid}>
          {faqs.map((faq) => (
            <article className={styles.item} key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
