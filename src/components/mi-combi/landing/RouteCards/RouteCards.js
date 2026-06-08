import { allRoutes } from "@/data/routes/allRoutes";
import { transportFares } from "@/data/transportConfig";
import StatusPill from "../../ui/StatusPill/StatusPill";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import Button from "../../ui/Button/Button";
import styles from "./RouteCards.module.css";

export default function RouteCards({ limit, showMoreHref }) {
  const visibleRoutes = limit ? allRoutes.slice(0, limit) : allRoutes;

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Rutas cargadas"
          title="Rutas disponibles en el sistema"
          text={`Informacion integrada y ordenada. Combi: ${transportFares.combiBaseLabel}.`}
        />
        <div className={styles.grid}>
          {visibleRoutes.map((route) => (
            <article className={styles.card} key={route.id}>
              <div className={styles.top}>
                <h3>{route.name}</h3>
                <StatusPill status={route.status} />
              </div>
              <p>
                {route.origin} {"->"} {route.destination}
              </p>
              <dl>
                <div>
                  <dt>Pasa por</dt>
                  <dd>{route.passesThrough.join(", ")}</dd>
                </div>
                <div>
                  <dt>Tiempo</dt>
                  <dd>{route.estimatedTime || "Por confirmar"}</dd>
                </div>
                <div>
                  <dt>Costo</dt>
                  <dd>{route.fare || "Por confirmar"}</dd>
                </div>
                <div>
                  <dt>Fuente</dt>
                  <dd>{route.sourceLabel || "Por confirmar"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        {showMoreHref ? (
          <div className={styles.actions}>
            <Button href={showMoreHref} variant="dark">
              Ver mas rutas
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
