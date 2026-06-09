"use client";

import { buildRouteGeoJSON } from "@/lib/geojsonHelpers";
import { buildRouteKML } from "@/lib/kmlHelpers";
import { downloadJSON, downloadTextFile } from "@/lib/downloadHelpers";
import Button from "../../ui/Button/Button";
import styles from "./RouteExportPanel.module.css";

const CONTACT_EMAIL = "gomez.50057@gmail.com";
const TELEGRAM_URL = "https://t.me/gomez50057";

function slugify(value) {
  return (value || "mi-combi-ruta")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RouteExportPanel({
  routeName,
  routeDescription,
  mainMunicipality,
  points,
}) {
  const canExport = points.length >= 2;
  const payload = { routeName, routeDescription, mainMunicipality, points };
  const filename = slugify(routeName);

  const downloadGeoJSON = () => {
    downloadJSON(buildRouteGeoJSON(payload), `${filename}.geojson`);
  };

  const downloadKML = () => {
    downloadTextFile(buildRouteKML(payload), `${filename}.kml`);
  };

  const openMail = () => {
    const subject = encodeURIComponent("Aporte de ruta para Mi Combi");
    const body = encodeURIComponent(
      `Ruta: ${routeName || "Ruta sin nombre"}\nMunicipio: ${
        mainMunicipality || "Sin definir"
      }\nPuntos marcados: ${points.length}\n\nAdjunto o comparto mi archivo de ruta.`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const openTelegram = () => {
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.panel}>
      <h3>Descarga y envia</h3>
      <p>Agrega al menos dos puntos para generar una linea.</p>
      <div className={styles.actions}>
        <Button disabled={!canExport} onClick={downloadGeoJSON}>
          Descargar GeoJSON
        </Button>
        <Button disabled={!canExport} onClick={downloadKML} variant="ghost">
          Descargar KML
        </Button>
        <Button onClick={openMail} variant="ghost">
          Enviar por correo
        </Button>
        <Button onClick={openTelegram} variant="secondary">
          Enviar por Telegram
        </Button>
      </div>
    </div>
  );
}
