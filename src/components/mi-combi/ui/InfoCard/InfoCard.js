import styles from "./InfoCard.module.css";

export default function InfoCard({ title, text, marker }) {
  return (
    <article className={styles.card}>
      {marker ? <span className={styles.marker}>{marker}</span> : null}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
