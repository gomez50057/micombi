"use client";

import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from "react-leaflet";
import { municipalities } from "@/data/municipalities";
import { useRouteDrawer } from "@/hooks/useRouteDrawer";
import Button from "../../ui/Button/Button";
import RouteExportPanel from "../RouteExportPanel/RouteExportPanel";
import RoutePointList from "../RoutePointList/RoutePointList";
import styles from "./RouteDrawer.module.css";

const PACHUCA_CENTER = [20.1011, -98.7591];
const INITIAL_ZOOM = 13;

function ClickHandler({ onAddPoint }) {
  useMapEvents({
    click(event) {
      onAddPoint(event.latlng);
    },
  });

  return null;
}

function numberedIcon(order) {
  return L.divIcon({
    className: styles.marker,
    html: `<span>${order}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function RouteDrawer() {
  const {
    routeName,
    setRouteName,
    routeDescription,
    setRouteDescription,
    mainMunicipality,
    setMainMunicipality,
    points,
    addPoint,
    removeLastPoint,
    clearPoints,
  } = useRouteDrawer();

  const linePositions = points.map((point) => [point.lat, point.lng]);

  return (
    <div className={styles.layout}>
      <section className={styles.mapWrap}>
        <MapContainer center={PACHUCA_CENTER} zoom={INITIAL_ZOOM}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onAddPoint={addPoint} />
          {points.map((point) => (
            <Marker
              icon={numberedIcon(point.order)}
              key={point.id}
              position={[point.lat, point.lng]}
            />
          ))}
          {linePositions.length >= 2 ? (
            <Polyline color="#FF5C39" positions={linePositions} weight={6} />
          ) : null}
        </MapContainer>
      </section>

      <aside className={styles.panel}>
        <div className={styles.formGroup}>
          <label>Nombre de ruta</label>
          <input
            onChange={(event) => setRouteName(event.target.value)}
            placeholder="Ejemplo: Centro - Providencia"
            value={routeName}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Descripcion o referencias</label>
          <textarea
            onChange={(event) => setRouteDescription(event.target.value)}
            placeholder="Pasa por Hospital General, Plaza Q..."
            rows="4"
            value={routeDescription}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Municipio principal</label>
          <select
            onChange={(event) => setMainMunicipality(event.target.value)}
            value={mainMunicipality}
          >
            <option value="">Selecciona municipio</option>
            {municipalities.map((municipality) => (
              <option key={municipality}>{municipality}</option>
            ))}
          </select>
        </div>
        <div className={styles.actions}>
          <Button
            disabled={points.length === 0}
            onClick={removeLastPoint}
            variant="ghost"
          >
            Eliminar ultimo punto
          </Button>
          <Button disabled={points.length === 0} onClick={clearPoints} variant="dark">
            Limpiar ruta
          </Button>
        </div>
        <RoutePointList points={points} />
        <RouteExportPanel
          mainMunicipality={mainMunicipality}
          points={points}
          routeDescription={routeDescription}
          routeName={routeName}
        />
      </aside>
    </div>
  );
}
