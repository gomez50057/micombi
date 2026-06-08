import Badge from "../Badge/Badge";
import styles from "./SectionHeader.module.css";

export default function SectionHeader({ eyebrow, title, text, center = false }) {
  return (
    <div className={`${styles.header} ${center ? styles.center : ""}`}>
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
