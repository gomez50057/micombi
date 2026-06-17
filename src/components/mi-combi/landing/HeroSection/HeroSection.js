import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSection.module.css";

const frequentRoutes = [
  { label: "Centro", tone: "teal" },
  { label: "Hospital", tone: "red" },
  { label: "Providencia", tone: "yellow" },
];

function BookIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 5.5C5.7 4.6 7.8 4 10 4c1.1 0 2 .9 2 2v13c0-1.1-.9-2-2-2-2.2 0-4.3.6-6 1.5v-13Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M20 5.5C18.3 4.6 16.2 4 14 4c-1.1 0-2 .9-2 2v13c0-1.1.9-2 2-2 2.2 0 4.3.6 6 1.5v-13Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 18c4 0 4-4 8-4s4-4 8-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path
        d="M5 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM23 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DrawIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="m15.5 3.5 5 5L12 17l-5.5 1.5L8 13l7.5-9.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 11.5 7.5 11.5s7.5-5.9 7.5-11.5A7.5 7.5 0 0 0 12 2.5Zm0 10.1a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z" />
    </svg>
  );
}

function UnderlineDecor() {
  return (
    <svg
      aria-hidden="true"
      className={styles.underlineDecor}
      fill="none"
      viewBox="0 0 340 24"
    >
      <path
        d="M4 17.5C79.5 9.5 183 7 336 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M13 19.5C94.5 15.5 207.5 15.5 306 18.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeOpacity="0.35"
        strokeWidth="3"
      />
    </svg>
  );
}

function SparkDecor() {
  return (
    <svg
      aria-hidden="true"
      className={styles.sparkDecor}
      fill="none"
      viewBox="0 0 64 64"
    >
      <path
        d="M16 11 7 40"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="11"
      />
      <path
        d="M36 29 20 44"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="11"
      />
      <path
        d="M58 48 36 52"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="11"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.3 10.6 20C5.4 15.3 2 12.2 2 8.4 2 5.3 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2 1.1-1.2 2.8-2 4.5-2C19.6 3 22 5.3 22 8.4c0 3.8-3.4 6.9-8.6 11.6L12 21.3Z" />
    </svg>
  );
}

function ShareRouteCard() {
  return (
    <aside className={styles.shareCard} aria-label="Comparte tu ruta">
      <div className={styles.shareIcon}>
        <RouteIcon />
      </div>
      <div className={styles.shareCopy}>
        <h2>Comparte tu ruta</h2>
        <p>
          Ayuda a mejorar el mapa con recorridos, paradas y trayectos
          compartidos por la comunidad.
        </p>
      </div>
      <div className={styles.heartIcon}>
        <HeartIcon />
      </div>
    </aside>
  );
}

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>
              <BookIcon />
            </span>
            Mapa ciudadano de combis en Pachuca
          </div>
          <h1>
            Encuentra
            <span>la combi que</span>
            <strong className={styles.highlightLine}>
              sí te deja
              <UnderlineDecor />
            </strong>
            <span className={styles.closeLine}>
              cerca
              <SparkDecor />
            </span>
          </h1>
          <p className={styles.text}>
            Busca tu destino, revisa por dónde pasa y descubre qué ruta te
            acerca más. Mi Combi está hecha para moverte sin vueltas, sin
            adivinar y sin perder tiempo.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/rutas">
              <span className={styles.actionIcon}>
                <RouteIcon />
              </span>
              Buscar ruta
            </Link>
            <Link className={styles.secondaryAction} href="/mapa">
              <span className={styles.actionIcon}>
                <DrawIcon />
              </span>
              Ver ruta en el mapa
            </Link>
          </div>
          <div className={styles.frequent}>
            <h2>Rutas frecuentes</h2>
            <div className={styles.routeList}>
              {frequentRoutes.map((route) => (
                <Link
                  className={`${styles.routeChip} ${styles[route.tone]}`}
                  href="/rutas"
                  key={route.label}
                >
                  <span className={styles.chipIcon}>
                    <PinIcon />
                  </span>
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.visual}>
          <Image
            alt=""
            className={styles.combiImage}
            height={3950}
            priority
            sizes="(max-width: 860px) 88vw, 58vw"
            src="/img/combi.png"
            width={3550}
          />
          <ShareRouteCard />
        </div>
      </div>
    </section>
  );
}
