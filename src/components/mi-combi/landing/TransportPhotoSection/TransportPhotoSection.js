/* eslint-disable @next/next/no-img-element */
import { transportPhotos } from "@/data/generated/transportPhotos";
import SectionHeader from "../../ui/SectionHeader/SectionHeader";
import styles from "./TransportPhotoSection.module.css";

export default function TransportPhotoSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Referencias"
          title="Fotos y datos para reconocer rutas"
          text="Referencias visuales para ubicar estaciones, alimentadoras y puntos conocidos sin salir de Mi Combi."
        />

        <div className={styles.grid}>
          {transportPhotos.slice(0, 8).map((photo) => (
            <article
              className={styles.photoCard}
              key={photo.id}
            >
              <img alt={photo.title} loading="lazy" src={photo.image} />
              <div>
                <strong>{photo.title}</strong>
                <span>{photo.subtitle}</span>
                <small>Referencia institucional</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
