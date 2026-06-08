import Link from "next/link";
import styles from "./Footer.module.css";

const footerLinks = [
  ["Inicio", "/"],
  ["Mapa", "/mapa"],
  ["Rutas", "/rutas"],
  ["Contribuye", "/contribuye"],
  ["Tutoriales", "/tutoriales"],
  ["Trazar ruta", "/trazar-ruta"],
  ["Aviso de privacidad", "/"],
  ["Contacto", "/contribuye"],
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <h2>Mi Combi</h2>
          <strong>La que si te deja.</strong>
          <p>
            Mapa ciudadano de rutas de combis en Pachuca y su zona
            metropolitana.
          </p>
          <p>
            Proyecto personal, independiente y sin fines de lucro. La
            informacion puede estar en revision o por confirmar.
          </p>
        </div>
        <nav className={styles.links}>
          {footerLinks.map(([label, href]) => (
            <Link href={href} key={label}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
