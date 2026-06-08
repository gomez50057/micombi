import styles from "./DevelopmentNotice.module.css";

export default function DevelopmentNotice() {
  return (
    <section className="section">
      <div className="container">
        <article className={styles.notice}>
          <h2>Esta ruta todavia se esta armando</h2>
          <p>
            Mi Combi esta en desarrollo y en constante crecimiento. Por ahora
            estamos juntando, revisando y ordenando rutas de combis en Pachuca y
            su zona metropolitana.
          </p>
          <p>
            Este es un proyecto personal, independiente y sin fines de lucro. No
            es una plataforma oficial ni gubernamental. Algunas rutas pueden
            estar en revision, por confirmar o como trazo preliminar.
          </p>
          <p>
            La idea es que la comunidad pueda ayudar a tener un mapa mas
            completo, mas claro y mas util para quienes se mueven todos los dias
            en combi.
          </p>
        </article>
      </div>
    </section>
  );
}
