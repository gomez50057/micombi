"use client";

import { useEffect, useMemo, useState } from "react";
import { externalRouteTypes } from "@/data/generated/externalRoutes";
import { municipalities } from "@/data/municipalities";
import { routeStatuses } from "@/data/routeStatuses";
import { allRoutes } from "@/data/routes/allRoutes";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import { notify } from "@/lib/notifications";
import {
  buildRouteReportText,
  formatRouteDistance,
  getRouteDistanceFromUser,
  getRouteQuality,
  getRouteShareHref,
  getRouteTypeLabel,
} from "@/lib/routeInsights";
import {
  clearSearchHistory,
  getRouteFavorites,
  getSearchHistory,
  saveSearchHistoryItem,
  toggleRouteFavorite,
} from "@/lib/storageHelpers";
import StatusPill from "../../ui/StatusPill/StatusPill";
import Button from "../../ui/Button/Button";
import styles from "./RouteSearch.module.css";

export default function RouteSearch({
  advanced = false,
  showFilters = true,
  resultLimit,
  showMoreHref,
  hideResultsUntilQuery = false,
}) {
  const {
    query,
    setQuery,
    municipality,
    setMunicipality,
    status,
    setStatus,
    filteredRoutes,
  } = useRouteSearch(allRoutes);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [quickFilter, setQuickFilter] = useState("all");
  const [viewMode, setViewMode] = useState("detail");
  const [compareIds, setCompareIds] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [copiedId, setCopiedId] = useState("");
  const [reportRouteId, setReportRouteId] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    if (!advanced) return;

    const timer = window.setTimeout(() => {
      setFavoriteIds(getRouteFavorites());
      setSearchHistory(getSearchHistory());

      const params = new URLSearchParams(window.location.search);
      const sharedRoutes = params.get("rutas") || params.get("ruta");
      const sharedQuery = params.get("q");

      if (sharedQuery) {
        setQuery(sharedQuery);
      }

      if (sharedRoutes) {
        const routeIds = sharedRoutes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const sharedRoute = allRoutes.find((route) => route.id === routeIds[0]);

        setCompareIds(routeIds.slice(0, 3));
        if (sharedRoute) {
          setQuery(sharedRoute.name);
        }
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [advanced, setQuery]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const compareSet = useMemo(() => new Set(compareIds), [compareIds]);

  const enrichedRoutes = useMemo(() => {
    return filteredRoutes.map((route) => ({
      ...route,
      distanceKm: getRouteDistanceFromUser(route, userPosition),
      quality: getRouteQuality(route),
    }));
  }, [filteredRoutes, userPosition]);

  const advancedFilteredRoutes = useMemo(() => {
    let nextRoutes = enrichedRoutes;

    if (quickFilter === "favorites") {
      nextRoutes = nextRoutes.filter((route) => favoriteSet.has(route.id));
    }

    if (quickFilter === "combi") {
      nextRoutes = nextRoutes.filter((route) => route.routeType === "combi");
    }

    if (quickFilter === "tuzobus") {
      nextRoutes = nextRoutes.filter((route) =>
        String(route.routeType || "").startsWith("tuzobus")
      );
    }

    if (quickFilter === "validated") {
      nextRoutes = nextRoutes.filter((route) => route.status === "validated");
    }

    if (quickFilter === "photos") {
      nextRoutes = nextRoutes.filter((route) => route.photos?.length > 0);
    }

    if (quickFilter === "nearby" && userPosition) {
      nextRoutes = [...nextRoutes].sort((first, second) => {
        const firstDistance = first.distanceKm ?? Number.POSITIVE_INFINITY;
        const secondDistance = second.distanceKm ?? Number.POSITIVE_INFINITY;
        return firstDistance - secondDistance;
      });
    }

    return nextRoutes;
  }, [enrichedRoutes, favoriteSet, quickFilter, userPosition]);

  const routesForResults = advanced ? advancedFilteredRoutes : filteredRoutes;
  const shouldShowResults =
    !hideResultsUntilQuery || query.trim().length > 0 || advanced;
  let visibleRoutes = [];

  if (shouldShowResults) {
    visibleRoutes = resultLimit
      ? routesForResults.slice(0, resultLimit)
      : routesForResults;
  }

  const compareRoutes = compareIds
    .map((routeId) => allRoutes.find((route) => route.id === routeId))
    .filter(Boolean);
  const reportRoute = allRoutes.find((route) => route.id === reportRouteId);

  const commitSearch = (nextQuery) => {
    if (!advanced) return;
    const nextHistory = saveSearchHistoryItem(nextQuery);
    setSearchHistory(nextHistory);

    if (String(nextQuery || "").trim().length >= 3) {
      notify({
        message: "La busqueda quedo en tu historial local.",
        title: "Busqueda guardada",
        tone: "success",
      });
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      notify({
        message: "Tu navegador no permite usar ubicacion.",
        title: "Ubicacion no disponible",
        tone: "warning",
      });
      return;
    }

    setLocationStatus("loading");
    notify({
      message: "Estamos buscando rutas cercanas a tu posicion.",
      title: "Buscando ubicacion",
      tone: "info",
    });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("ready");
        setQuickFilter("nearby");
        notify({
          message: "Las rutas con trazo se ordenaron por cercania.",
          title: "Rutas cercanas listas",
          tone: "success",
        });
      },
      () => {
        setLocationStatus("error");
        notify({
          message: "No se pudo obtener tu ubicacion.",
          title: "Ubicacion no disponible",
          tone: "danger",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      }
    );
  };

  const handleQuickFilter = (filter) => {
    if (filter === "nearby" && !userPosition) {
      requestLocation();
      return;
    }

    setQuickFilter(filter);
    notify({
      message: `Filtro aplicado: ${quickFilters.find(([key]) => key === filter)?.[1] || "Rutas"}.`,
      title: "Filtro actualizado",
      tone: "info",
    });
  };

  const handleFavorite = (routeId) => {
    const route = allRoutes.find((item) => item.id === routeId);
    const wasFavorite = favoriteSet.has(routeId);
    setFavoriteIds(toggleRouteFavorite(routeId));
    notify({
      message: wasFavorite
        ? `${route?.name || "La ruta"} se quito de favoritas.`
        : `${route?.name || "La ruta"} se agrego a favoritas.`,
      title: wasFavorite ? "Favorita removida" : "Favorita guardada",
      tone: wasFavorite ? "warning" : "success",
    });
  };

  const handleCompare = (routeId) => {
    const route = allRoutes.find((item) => item.id === routeId);
    const wasCompared = compareSet.has(routeId);
    setCompareIds((currentIds) => {
      if (currentIds.includes(routeId)) {
        return currentIds.filter((id) => id !== routeId);
      }

      return [routeId, ...currentIds].slice(0, 3);
    });
    notify({
      message: wasCompared
        ? `${route?.name || "La ruta"} salio de la comparacion.`
        : `${route?.name || "La ruta"} se agrego a la comparacion.`,
      title: wasCompared ? "Comparacion actualizada" : "Ruta para comparar",
      tone: "info",
    });
  };

  const copyText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(""), 1800);
      notify({
        message: "Ya esta copiado en el portapapeles.",
        title: "Copiado",
        tone: "success",
      });
    } catch {
      setCopiedId("error");
      notify({
        message: "No se pudo copiar automaticamente.",
        title: "Copia no disponible",
        tone: "danger",
      });
    }
  };

  const copyRouteLink = (route) => {
    const path = getRouteShareHref(route.id);
    const shareUrl = `${window.location.origin}${path}`;
    copyText(`share-${route.id}`, shareUrl);
  };

  const quickFilters = [
    ["all", "Todas"],
    ["favorites", "Favoritas"],
    ["combi", "Combis"],
    ["tuzobus", "Tuzobus"],
    ["validated", "Validadas"],
    ["photos", "Con fotos"],
    ["nearby", "Cerca de mi"],
  ];

  return (
    <section className={styles.section} id={advanced ? "buscar-rutas" : undefined}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <h2>Checa tu ruta antes de salir</h2>
          <p>No te subas al a ver si me deja.</p>
        </div>
        <div className={styles.controls}>
          <input
            aria-label="Buscar ruta"
            onBlur={() => commitSearch(query)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitSearch(query);
              }
            }}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por destino, colonia o referencia"
            value={query}
          />
          {showFilters ? (
            <>
              <select
                aria-label="Filtrar por municipio"
                onChange={(event) => setMunicipality(event.target.value)}
                value={municipality}
              >
                <option>Todas</option>
                {municipalities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                aria-label="Filtrar por estado"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                <option>Todos</option>
                {Object.entries(routeStatuses).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
        {advanced ? (
          <>
            <div className={styles.quickFilters}>
              {quickFilters.map(([key, label]) => (
                <button
                  className={quickFilter === key ? styles.activeQuickFilter : ""}
                  key={key}
                  onClick={() => handleQuickFilter(key)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.advancedBar}>
              <div className={styles.segmented} aria-label="Cambiar vista">
                <button
                  className={viewMode === "detail" ? styles.activeSegment : ""}
                  onClick={() => setViewMode("detail")}
                  type="button"
                >
                  Detallada
                </button>
                <button
                  className={viewMode === "compact" ? styles.activeSegment : ""}
                  onClick={() => setViewMode("compact")}
                  type="button"
                >
                  Compacta
                </button>
              </div>
              <button
                className={styles.helpButton}
                onClick={() => {
                  setTutorialOpen((current) => !current);
                  notify({
                    message: tutorialOpen
                      ? "Se cerro la ayuda rapida."
                      : "Abri la guia rapida de uso.",
                    title: "Ayuda rapida",
                    tone: "info",
                  });
                }}
                type="button"
              >
                {tutorialOpen ? "Cerrar ayuda" : "Ver ayuda"}
              </button>
            </div>
            {tutorialOpen ? (
              <div className={styles.tutorialPanel}>
                <strong>Uso rapido</strong>
                <p>
                  Busca una colonia o destino, marca favoritas con la estrella,
                  compara hasta 3 rutas y copia el enlace para abrirlas directo
                  en el mapa.
                </p>
              </div>
            ) : null}
            {searchHistory.length > 0 ? (
              <div className={styles.history}>
                <span>Busquedas recientes</span>
                {searchHistory.map((item) => (
                  <button key={item} onClick={() => setQuery(item)} type="button">
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSearchHistory(clearSearchHistory());
                    notify({
                      message: "Se limpio el historial guardado en este navegador.",
                      title: "Historial limpio",
                      tone: "success",
                    });
                  }}
                  type="button"
                >
                  Limpiar
                </button>
              </div>
            ) : null}
            {locationStatus !== "idle" ? (
              <p className={styles.locationStatus}>
                {locationStatus === "loading"
                  ? "Buscando tu ubicacion..."
                  : locationStatus === "ready"
                    ? "Rutas ordenadas por cercania cuando tienen trazo."
                    : locationStatus === "unsupported"
                      ? "Tu navegador no permite ubicacion."
                      : "No se pudo obtener tu ubicacion."}
              </p>
            ) : null}
          </>
        ) : null}
        <div className={styles.results}>
          {visibleRoutes.map((route) => (
            <article
              className={`${styles.result} ${
                advanced && viewMode === "compact" ? styles.compactResult : ""
              }`}
              key={route.id}
            >
              <div>
                <h3>{route.name}</h3>
                <p>
                  {route.origin} {"->"} {route.destination}
                </p>
                {advanced && viewMode === "detail" ? (
                  <dl className={styles.metaGrid}>
                    <div>
                      <dt>Costo</dt>
                      <dd>{route.fare || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Frecuencia</dt>
                      <dd>{route.frequency || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{getRouteTypeLabel(route, externalRouteTypes)}</dd>
                    </div>
                    <div>
                      <dt>Cerca de ti</dt>
                      <dd>{formatRouteDistance(route.distanceKm)}</dd>
                    </div>
                  </dl>
                ) : null}
              </div>
              <div className={styles.resultAside}>
                <StatusPill status={route.status} />
                {advanced ? (
                  <>
                    <span
                      className={`${styles.qualityBadge} ${
                        styles[route.quality.tone]
                      }`}
                    >
                      {route.quality.label} {route.quality.score}%
                    </span>
                    <div className={styles.resultActions}>
                      <button
                        aria-pressed={favoriteSet.has(route.id)}
                        onClick={() => handleFavorite(route.id)}
                        type="button"
                      >
                        {favoriteSet.has(route.id) ? "Guardada" : "Favorita"}
                      </button>
                      <button
                        aria-pressed={compareSet.has(route.id)}
                        onClick={() => handleCompare(route.id)}
                        type="button"
                      >
                        {compareSet.has(route.id) ? "Quitar" : "Comparar"}
                      </button>
                      <button onClick={() => copyRouteLink(route)} type="button">
                        {copiedId === `share-${route.id}` ? "Copiado" : "Link"}
                      </button>
                      <button
                        onClick={() => {
                          const nextRouteId =
                            reportRouteId === route.id ? "" : route.id;
                          setReportRouteId(nextRouteId);
                          notify({
                            message: nextRouteId
                              ? "El texto del reporte esta listo para copiar."
                              : "Se cerro el reporte preparado.",
                            title: nextRouteId
                              ? "Reporte preparado"
                              : "Reporte cerrado",
                            tone: "info",
                          });
                        }}
                        type="button"
                      >
                        Reportar
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </article>
          ))}
          {shouldShowResults && routesForResults.length === 0 ? (
            <p className={styles.empty}>Todavia no aparece. Si sabes la ruta, pasala.</p>
          ) : null}
          {showMoreHref && shouldShowResults && routesForResults.length > visibleRoutes.length ? (
            <div className={styles.more}>
              <Button href={showMoreHref} variant="ghost">
                Ver mas resultados
              </Button>
            </div>
          ) : null}
        </div>
        {advanced && compareRoutes.length === 0 ? (
          <div className={styles.compareHint} id="comparar-rutas">
            <strong>Comparacion</strong>
            <p>Usa el boton Comparar en cualquier ruta para revisar diferencias.</p>
          </div>
        ) : null}
        {advanced && compareRoutes.length > 0 ? (
          <div className={styles.comparePanel} id="comparar-rutas">
            <div className={styles.compareHeader}>
              <h3>Comparacion de rutas</h3>
              <button onClick={() => setCompareIds([])} type="button">
                Limpiar comparacion
              </button>
            </div>
            <div className={styles.compareGrid}>
              {compareRoutes.map((route) => (
                <article key={route.id}>
                  <h4>{route.name}</h4>
                  <dl>
                    <div>
                      <dt>Origen</dt>
                      <dd>{route.origin || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Destino</dt>
                      <dd>{route.destination || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Costo</dt>
                      <dd>{route.fare || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Frecuencia</dt>
                      <dd>{route.frequency || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Calidad</dt>
                      <dd>{getRouteQuality(route).label}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        ) : null}
        {advanced && reportRoute ? (
          <div className={styles.reportPanel}>
            <div>
              <h3>Reporte listo para copiar</h3>
              <p>
                No se envia nada todavia. Copia el texto y pegalo en el canal
                que prefieras.
              </p>
            </div>
            <textarea readOnly value={buildRouteReportText(reportRoute)} />
            <button
              onClick={() =>
                copyText(`report-${reportRoute.id}`, buildRouteReportText(reportRoute))
              }
              type="button"
            >
              {copiedId === `report-${reportRoute.id}`
                ? "Reporte copiado"
                : "Copiar reporte"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
