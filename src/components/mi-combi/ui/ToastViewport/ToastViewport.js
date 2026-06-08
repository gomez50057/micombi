"use client";

import { useEffect, useState } from "react";
import styles from "./ToastViewport.module.css";

const TOAST_TIMEOUT = 3600;

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotify = (event) => {
      const nextToast = event.detail;

      setToasts((currentToasts) => [nextToast, ...currentToasts].slice(0, 4));

      window.setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== nextToast.id)
        );
      }, TOAST_TIMEOUT);
    };

    window.addEventListener("mi-combi-notify", handleNotify);

    return () => {
      window.removeEventListener("mi-combi-notify", handleNotify);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          className={`${styles.toast} ${styles[toast.tone] || styles.info}`}
          key={toast.id}
        >
          <span className={styles.marker} />
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            aria-label="Cerrar alerta"
            onClick={() =>
              setToasts((currentToasts) =>
                currentToasts.filter((item) => item.id !== toast.id)
              )
            }
            type="button"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
