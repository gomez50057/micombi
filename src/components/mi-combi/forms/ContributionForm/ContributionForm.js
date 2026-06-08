"use client";

import { useState } from "react";
import { municipalities } from "@/data/municipalities";
import { useLocalContributions } from "@/hooks/useLocalContributions";
import Button from "../../ui/Button/Button";
import styles from "./ContributionForm.module.css";

const initialForm = {
  routeName: "",
  startPoint: "",
  endPoint: "",
  direction: "",
  passesThrough: "",
  fare: "",
  frequency: "",
  municipality: "",
  fileName: "",
  comments: "",
};

export default function ContributionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [success, setSuccess] = useState(false);
  const { addContribution } = useLocalContributions();

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addContribution(formData);
    setFormData(initialForm);
    setSuccess(true);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2>Manda tu aporte</h2>
        <p>
          Por ahora se guarda temporalmente en este navegador. Despues esta
          funcion se reemplazara por una API en Django.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.formGroup}>
          <label>Nombre o numero de ruta</label>
          <input
            onChange={(event) => updateField("routeName", event.target.value)}
            placeholder="Ejemplo: 74 PCH C, Colosio, Centro, Tulipanes..."
            required
            value={formData.routeName}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Municipio principal</label>
          <select
            onChange={(event) => updateField("municipality", event.target.value)}
            value={formData.municipality}
          >
            <option value="">Selecciona municipio</option>
            {municipalities.map((municipality) => (
              <option key={municipality}>{municipality}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Donde te subiste?</label>
          <input
            onChange={(event) => updateField("startPoint", event.target.value)}
            placeholder="Ejemplo: Me subi en Plaza Q"
            value={formData.startPoint}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Donde te bajaste?</label>
          <input
            onChange={(event) => updateField("endPoint", event.target.value)}
            placeholder="Ejemplo: Me baje en el Centro"
            value={formData.endPoint}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Hacia donde iba?</label>
          <input
            onChange={(event) => updateField("direction", event.target.value)}
            placeholder="Ejemplo: Va hacia Providencia"
            value={formData.direction}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Cuanto cobra?</label>
          <input
            onChange={(event) => updateField("fare", event.target.value)}
            placeholder="Ejemplo: Cobra $12"
            value={formData.fare}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Cada cuanto pasa?</label>
          <input
            onChange={(event) => updateField("frequency", event.target.value)}
            placeholder="Ejemplo: Cada 10 o 15 minutos"
            value={formData.frequency}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Subir archivo GPX, KML, KMZ, GeoJSON o CSV</label>
          <input
            accept=".gpx,.kml,.kmz,.geojson,.json,.csv"
            onChange={(event) =>
              updateField("fileName", event.target.files?.[0]?.name || "")
            }
            type="file"
          />
        </div>
        <div className={`${styles.formGroup} ${styles.full}`}>
          <label>Por donde pasa?</label>
          <textarea
            onChange={(event) => updateField("passesThrough", event.target.value)}
            placeholder="Ejemplo: Pasa por Hospital General y Revolucion"
            rows="4"
            value={formData.passesThrough}
          />
        </div>
        <div className={`${styles.formGroup} ${styles.full}`}>
          <label>Comentarios</label>
          <textarea
            onChange={(event) => updateField("comments", event.target.value)}
            placeholder="Referencias, cambios recientes o cualquier dato que ayude"
            rows="4"
            value={formData.comments}
          />
        </div>
      </div>

      <Button type="submit">Enviar aporte</Button>
      {success ? (
        <p className={styles.success}>
          Gracias por pasar el dato! Revisaremos tu aporte antes de publicarlo
          en el mapa.
        </p>
      ) : null}
    </form>
  );
}
