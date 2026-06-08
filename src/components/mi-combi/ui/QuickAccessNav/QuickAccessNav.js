import styles from "./QuickAccessNav.module.css";

export default function QuickAccessNav({ items }) {
  return (
    <nav className={styles.nav} aria-label="Accesos rapidos">
      <span>Ir a</span>
      <div>
        {items.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
