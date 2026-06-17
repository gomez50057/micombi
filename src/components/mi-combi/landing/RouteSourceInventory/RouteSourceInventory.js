"use client";

import { useMemo, useState } from "react";

import {
  pachucaDetectedRouteInventory,
  detectedRouteCoverageLabels,
} from "@/data/routes/pachucaDetectedRouteInventory";

import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./RouteSourceInventory.module.css";

const SOURCE_URL =
  "https://bibliotecadigitaluplaph.hidalgo.gob.mx/Biblioteca%20Digital%20de%20Planeaci%C3%B3n/Metropolitano/Programas/Actualizaci%C3%B3n%20del%20Programa%20de%20Desarrollo%20Urbano%20y%20Ordenamiento%20Territorial%20de%20la%20Zona%20Metropolitana%20de%20Pachuca,%20Hidalgo%20(PDUyOT%20ZMP).pdf";

const ALL_MUNICIPALITIES = "todos";

export default function RouteSourceInventory() {
  const [selectedMunicipality, setSelectedMunicipality] =
    useState(ALL_MUNICIPALITIES);

  const municipalities = useMemo(() => {
    return Array.from(
      new Set(pachucaDetectedRouteInventory.map((route) => route.municipality))
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, []);

  const filteredRoutes = useMemo(() => {
    if (selectedMunicipality === ALL_MUNICIPALITIES) {
      return pachucaDetectedRouteInventory;
    }

    return pachucaDetectedRouteInventory.filter(
      (route) => route.municipality === selectedMunicipality
    );
  }, [selectedMunicipality]);

  const counts = filteredRoutes.reduce(
    (totals, route) => ({
      ...totals,
      [route.coverage]: (totals[route.coverage] || 0) + 1,
    }),
    {}
  );

  const totalUnits = filteredRoutes.reduce(
    (total, route) => total + (Number(route.units) || 0),
    0
  );

  return (
    <section className="section" id="inventario-rutas">
      <div className="container">
        <SectionHeader
          eyebrow="Rutas detectadas"
          title="Inventario base para integrar a Mi Combi"
          text="Rutas identificadas en la Tabla No. 55 del inventario de derroteros y costo de STCH. Este listado nos ayuda a validar recorridos, paradas, costos y variantes antes de integrarlas al mapa. Ojo: algunos costos pueden estar desactualizados; por reportes de usuarios sabemos que varias rutas que antes aparecían en $10 ahora rondan los $12. Iremos corrigiendo esta información con apoyo de la comunidad."
        />

        <div className={styles.filters} aria-label="Filtros de rutas">
          <label className={styles.filterGroup} htmlFor="municipality-filter">
            <span>Filtrar por municipio</span>

            <select
              id="municipality-filter"
              value={selectedMunicipality}
              onChange={(event) => setSelectedMunicipality(event.target.value)}
            >
              <option value={ALL_MUNICIPALITIES}>
                Todos los municipios
              </option>

              {municipalities.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
          </label>

          {selectedMunicipality !== ALL_MUNICIPALITIES && (
            <button
              className={styles.clearFilter}
              type="button"
              onClick={() => setSelectedMunicipality(ALL_MUNICIPALITIES)}
            >
              Limpiar filtro
            </button>
          )}
        </div>

        <div className={styles.summary} aria-label="Resumen de rutas detectadas">
          <span>{filteredRoutes.length} rutas detectadas</span>
          <span>{totalUnits} unidades registradas</span>
          <span>{counts.detected || 0} pendientes por validar</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Municipio</th>
                <th>Ruta</th>
                <th>Recorrido de la ruta</th>
                <th>Vehículo</th>
                <th>Unidades</th>
                <th>Costo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route.id}>
                  <td data-label="Municipio">{route.municipality}</td>

                  <td data-label="Ruta">
                    <strong>{route.routeCode}</strong>
                  </td>

                  <td data-label="Recorrido de la ruta">{route.derrotero}</td>

                  <td data-label="Vehículo">
                    {route.vehicleType || "Sin dato"}
                  </td>

                  <td data-label="Unidades">{route.units || "Sin dato"}</td>

                  <td data-label="Costo">
                    {route.fareMin && route.fareMax
                      ? route.fareMin === route.fareMax
                        ? `$${route.fareMin}`
                        : `$${route.fareMin} - $${route.fareMax}`
                      : "Sin dato"}
                  </td>

                  <td data-label="Estado">
                    <span
                      className={`${styles.coverage} ${styles[route.coverage] || ""
                        }`}
                    >
                      {detectedRouteCoverageLabels[route.coverage] ||
                        "Por revisar"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRoutes.length === 0 && (
            <p className={styles.emptyState}>
              No se encontraron rutas para este municipio.
            </p>
          )}

          <p className={styles.sourceNote}>
            Información obtenida de la{" "}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              Actualización del Programa de Desarrollo Urbano y Ordenamiento
              Territorial de la Zona Metropolitana de Pachuca, Hidalgo (PDUyOT
              ZMP)
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
} 