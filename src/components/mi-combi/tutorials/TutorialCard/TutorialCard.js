import styles from "./TutorialCard.module.css";

export default function TutorialCard({ title, text, children }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {children}
    </article>
  );
}
