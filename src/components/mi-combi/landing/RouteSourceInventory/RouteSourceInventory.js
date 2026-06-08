import { pachucaInfoRouteInventory } from "@/data/routes/pachucaInfoRoutes";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./RouteSourceInventory.module.css";

const coverageLabels = {
  loaded: "Ya la tenemos",
  partial: "Variante cargada",
  missing: "Hace falta",
};

export default function RouteSourceInventory() {
  const counts = pachucaInfoRouteInventory.reduce(
    (totals, route) => ({
      ...totals,
      [route.coverage]: (totals[route.coverage] || 0) + 1,
    }),
    {}
  );

  return (
    <section className="section" id="inventario-rutas">
      <div className="container">
        <SectionHeader
          eyebrow="Inventario de fuente"
          title="Rutas externas por integrar"
          text="Revision contra la base local para saber cuales ya tienen informacion cargada y cuales necesitan trazo o detalle."
        />

        <div className={styles.summary} aria-label="Resumen de cobertura">
          <span>{counts.loaded || 0} ya cargada</span>
          <span>{counts.partial || 0} con variante</span>
          <span>{counts.missing || 0} hacen falta</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ruta registrada</th>
                <th>Origen del dato</th>
                <th>Estado en Mi Combi</th>
                <th>Observacion</th>
              </tr>
            </thead>
            <tbody>
              {pachucaInfoRouteInventory.map((route) => (
                <tr key={route.name}>
                  <td data-label="Ruta registrada">{route.name}</td>
                  <td data-label="Origen del dato">Registro externo</td>
                  <td data-label="Estado en Mi Combi">
                    <span
                      className={`${styles.coverage} ${
                        styles[route.coverage]
                      }`}
                    >
                      {coverageLabels[route.coverage]}
                    </span>
                  </td>
                  <td data-label="Observacion">{route.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
