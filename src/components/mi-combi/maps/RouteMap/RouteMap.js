"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
} from "react-leaflet";
import { allRoutes } from "@/data/routes/allRoutes";
import { externalRouteTypes } from "@/data/generated/externalRoutes";
import { municipalities } from "@/data/municipalities";
import { routeStatuses } from "@/data/routeStatuses";
import { tuzobusPoints } from "@/data/generated/tuzobusPoints";
import { findNearbyRouteIntersections } from "@/lib/mapAnalysis";
import { notify } from "@/lib/notifications";
import {
  formatRouteDistance,
  getRouteDistanceFromUser,
  getRouteShareHref,
} from "@/lib/routeInsights";
import {
  getRouteFavorites,
  toggleRouteFavorite,
} from "@/lib/storageHelpers";
import StatusPill from "../../ui/StatusPill/StatusPill";
import MapLegend from "../MapLegend/MapLegend";
import styles from "./RouteMap.module.css";

const PACHUCA_CENTER = [20.1011, -98.7591];
const INITIAL_ZOOM = 12;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;
const USER_LOCATION_ZOOM = 17;
const MAX_VISIBLE_ROUTES = 28;
const ZMP_BOUNDS = [
  [19.94, -98.96],
  [20.28, -98.52],
];
const NOMINATIM_VIEWBOX = "-98.96,20.28,-98.52,19.94";
const mappableRoutes = allRoutes.filter((route) => route.geojson);

const routeTypeOptions = {
  Todos: "Todos",
  ...externalRouteTypes,
};

const isInsideZmp = (lat, lng) =>
  lat >= ZMP_BOUNDS[0][0] &&
  lat <= ZMP_BOUNDS[1][0] &&
  lng >= ZMP_BOUNDS[0][1] &&
  lng <= ZMP_BOUNDS[1][1];

function MapFocus({ place }) {
  const map = useMap();

  useEffect(() => {
    if (!place) return;
    map.setView([place.lat, place.lng], USER_LOCATION_ZOOM, { animate: true });
  }, [map, place]);

  return null;
}

function CtrlWheelZoom() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const handleWheel = (event) => {
      if (!event.ctrlKey) return;

      event.preventDefault();
      if (event.deltaY < 0) {
        map.zoomIn();
      } else {
        map.zoomOut();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  return null;
}

function MapResizeWatcher({ watch }) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [map, watch]);

  return null;
}

function LocateButton({ onLocated }) {
  const map = useMap();
  const [status, setStatus] = useState("idle");

  const centerOnUser = () => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      notify({
        message: "Tu navegador no permite usar ubicacion.",
        title: "Ubicacion no disponible",
        tone: "warning",
      });
      return;
    }

    setStatus("loading");
    notify({
      message: "Estoy buscando tu posicion en el mapa.",
      title: "Buscando ubicacion",
      tone: "info",
    });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        if (!isInsideZmp(nextPosition[0], nextPosition[1])) {
          setStatus("outside");
          notify({
            message: "Tu ubicacion esta fuera de la zona metropolitana aprobada.",
            title: "Fuera de cobertura",
            tone: "warning",
          });
          return;
        }

        map.setView(nextPosition, USER_LOCATION_ZOOM, { animate: true });
        onLocated({
          accuracy: position.coords.accuracy,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("ready");
        notify({
          message: "El mapa se centro en tu ubicacion.",
          title: "Ubicacion lista",
          tone: "success",
        });
      },
      () => {
        setStatus("error");
        notify({
          message: "No se pudo obtener tu ubicacion.",
          title: "Ubicacion no disponible",
          tone: "danger",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      }
    );
  };

  const label =
    status === "loading"
      ? "Buscando ubicacion"
      : status === "error"
        ? "No se pudo obtener tu ubicacion"
      : status === "unsupported"
        ? "Tu navegador no permite ubicacion"
        : status === "outside"
          ? "Tu ubicacion esta fuera de la ZMP"
          : "Ir a mi ubicacion";

  return (
    <button
      aria-label={label}
      className={styles.locateButton}
      onClick={(event) => {
        event.stopPropagation();
        centerOnUser();
      }}
      title={label}
      type="button"
    >
      <span className={styles.locateIcon} />
    </button>
  );
}

export default function RouteMap() {
  const [query, setQuery] = useState("");
  const [municipality, setMunicipality] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [routeType, setRouteType] = useState("Todos");
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortNearby, setSortNearby] = useState(false);
  const [showStations, setShowStations] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [copiedRouteId, setCopiedRouteId] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [placeStatus, setPlaceStatus] = useState("idle");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sidebarPanelMode, setSidebarPanelMode] = useState("normal");
  const [routePanelMode, setRoutePanelMode] = useState("normal");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState(() =>
    mappableRoutes.slice(0, 6).map((route) => route.id)
  );
  const [urlParamsReady, setUrlParamsReady] = useState(false);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFavoriteIds(getRouteFavorites());

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
          .filter((routeId) =>
            mappableRoutes.some((route) => route.id === routeId)
          );

        if (routeIds.length > 0) {
          setSelectedRouteIds(routeIds.slice(0, MAX_VISIBLE_ROUTES));
        }
      }

      setUrlParamsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!urlParamsReady) return;

    const params = new URLSearchParams();
    if (selectedRouteIds.length > 0) {
      params.set("rutas", selectedRouteIds.join(","));
    }

    if (query.trim()) {
      params.set("q", query.trim());
    }

    const nextUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
  }, [query, selectedRouteIds, urlParamsReady]);

  useEffect(() => {
    if (!isMapFullscreen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMapFullscreen]);

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    const nextRoutes = mappableRoutes.filter((route) => {
      const searchableText = [
        route.name,
        route.origin,
        route.destination,
        route.fare,
        route.frequency,
        route.schedule,
        route.sourceLabel,
        route.routeType,
        ...(route.municipalities || []),
        ...(route.passesThrough || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesMunicipality =
        municipality === "Todas" || route.municipalities?.includes(municipality);
      const matchesStatus = status === "Todos" || route.status === status;
      const matchesType = routeType === "Todos" || route.routeType === routeType;
      const matchesPhotos = !onlyWithPhotos || route.photos?.length > 0;
      const matchesFavorites = !onlyFavorites || favoriteSet.has(route.id);

      return (
        matchesQuery &&
        matchesMunicipality &&
        matchesStatus &&
        matchesType &&
        matchesPhotos &&
        matchesFavorites
      );
    });

    if (sortNearby && userPosition) {
      return [...nextRoutes].sort((first, second) => {
        const firstDistance =
          getRouteDistanceFromUser(first, userPosition) ?? Number.POSITIVE_INFINITY;
        const secondDistance =
          getRouteDistanceFromUser(second, userPosition) ?? Number.POSITIVE_INFINITY;

        return firstDistance - secondDistance;
      });
    }

    return nextRoutes;
  }, [
    favoriteSet,
    municipality,
    onlyFavorites,
    onlyWithPhotos,
    query,
    routeType,
    sortNearby,
    status,
    userPosition,
  ]);

  const selectedRoutes = useMemo(() => {
    const selectedSet = new Set(selectedRouteIds);
    return mappableRoutes.filter((route) => selectedSet.has(route.id));
  }, [selectedRouteIds]);

  const visibleRoutes =
    selectedRoutes.length > 0
      ? selectedRoutes
      : filteredRoutes.slice(0, MAX_VISIBLE_ROUTES);

  const intersections = useMemo(
    () => findNearbyRouteIntersections(selectedRoutes, 95),
    [selectedRoutes]
  );

  const visiblePoints = useMemo(() => {
    return tuzobusPoints.filter((point) => {
      if (point.type === "station") return showStations;
      if (point.type === "recharge") return showRecharge;
      return false;
    });
  }, [showRecharge, showStations]);

  const toggleRoute = (routeId) => {
    const route = mappableRoutes.find((item) => item.id === routeId);
    const isSelected = selectedRouteIds.includes(routeId);
    setSelectedRouteIds((current) =>
      current.includes(routeId)
        ? current.filter((id) => id !== routeId)
        : [...current, routeId]
    );
    notify({
      message: isSelected
        ? `${route?.name || "La ruta"} se quito del mapa.`
        : `${route?.name || "La ruta"} se agrego al mapa.`,
      title: isSelected ? "Ruta removida" : "Ruta agregada",
      tone: isSelected ? "warning" : "success",
    });
  };

  const selectFilteredRoutes = () => {
    setSelectedRouteIds(filteredRoutes.slice(0, MAX_VISIBLE_ROUTES).map((route) => route.id));
    notify({
      message: `Se seleccionaron hasta ${MAX_VISIBLE_ROUTES} rutas filtradas.`,
      title: "Rutas seleccionadas",
      tone: "success",
    });
  };

  const handleFavorite = (routeId) => {
    const route = mappableRoutes.find((item) => item.id === routeId);
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

  const copyRouteLink = async (routeId) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${getRouteShareHref(routeId)}`
      );
      setCopiedRouteId(routeId);
      window.setTimeout(() => setCopiedRouteId(""), 1800);
      notify({
        message: "El enlace directo al mapa quedo copiado.",
        title: "Link copiado",
        tone: "success",
      });
    } catch {
      setCopiedRouteId("error");
      notify({
        message: "No se pudo copiar automaticamente.",
        title: "Copia no disponible",
        tone: "danger",
      });
    }
  };

  const searchPlaces = async (event) => {
    event.preventDefault();

    const trimmedQuery = placeQuery.trim();
    if (trimmedQuery.length < 3) {
      setPlaceStatus("short");
      setPlaceResults([]);
      notify({
        message: "Escribe al menos 3 caracteres para buscar un lugar.",
        title: "Busqueda muy corta",
        tone: "warning",
      });
      return;
    }

    setPlaceStatus("loading");
    setPlaceResults([]);
    notify({
      message: `Buscando "${trimmedQuery}" dentro de la ZMP.`,
      title: "Buscando lugar",
      tone: "info",
    });

    const params = new URLSearchParams({
      addressdetails: "1",
      bounded: "1",
      countrycodes: "mx",
      format: "jsonv2",
      limit: "6",
      q: `${trimmedQuery}, Hidalgo, Mexico`,
      viewbox: NOMINATIM_VIEWBOX,
    });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { "Accept-Language": "es-MX,es;q=0.9" } }
      );

      if (!response.ok) throw new Error("search_failed");

      const data = await response.json();
      const approvedResults = data
        .map((item) => ({
          id: item.place_id,
          name: item.name || item.display_name?.split(",")[0] || trimmedQuery,
          label: item.display_name,
          lat: Number(item.lat),
          lng: Number(item.lon),
        }))
        .filter((item) => isInsideZmp(item.lat, item.lng));

      setPlaceResults(approvedResults);
      setPlaceStatus(approvedResults.length > 0 ? "ready" : "empty");
      notify({
        message:
          approvedResults.length > 0
            ? `Encontramos ${approvedResults.length} coincidencias.`
            : "No encontramos resultados dentro de los municipios aprobados.",
        title:
          approvedResults.length > 0
            ? "Lugar encontrado"
            : "Sin resultados",
        tone: approvedResults.length > 0 ? "success" : "warning",
      });
    } catch {
      setPlaceStatus("error");
      setPlaceResults([]);
      notify({
        message: "No se pudo consultar el buscador libre por ahora.",
        title: "Busqueda no disponible",
        tone: "danger",
      });
    }
  };

  return (
    <div
      className={`${styles.layout} ${
        isMapFullscreen ? styles.fullscreen : ""
      }`}
    >
      <aside
        className={`${styles.sidebar} ${
          sidebarPanelMode === "minimized" ? styles.minimized : ""
        } ${sidebarPanelMode === "maximized" ? styles.maximizedPanel : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Mapa para planear</h2>
              <p>
                {filteredRoutes.length} rutas encontradas -{" "}
                {selectedRoutes.length} seleccionadas
              </p>
            </div>
            <div className={styles.panelTools}>
              <button
                onClick={() =>
                  setSidebarPanelMode((current) =>
                    current === "minimized" ? "normal" : "minimized"
                  )
                }
                type="button"
              >
                {sidebarPanelMode === "minimized" ? "Mostrar" : "Minimizar"}
              </button>
              <button
                onClick={() =>
                  setSidebarPanelMode((current) =>
                    current === "maximized" ? "normal" : "maximized"
                  )
                }
                type="button"
              >
                {sidebarPanelMode === "maximized" ? "Normal" : "Maximizar"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.filters}>
            <div className={styles.filterBody}>
              <button
                className={styles.mapModeButton}
                onClick={() => {
                  setIsMapFullscreen(!isMapFullscreen);
                  notify({
                    message: isMapFullscreen
                      ? "El mapa regreso a la vista normal."
                      : "El mapa ahora ocupa toda la pantalla.",
                    title: isMapFullscreen ? "Vista normal" : "Mapa completo",
                    tone: "info",
                  });
                }}
                type="button"
              >
                {isMapFullscreen ? "Salir pantalla" : "Mapa completo"}
              </button>

            <label>
              Buscar rutas
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Destino, colonia, numero, referencia"
                value={query}
              />
            </label>

            <form className={styles.placeSearch} onSubmit={searchPlaces}>
              <label>
                Buscar lugar libre en ZMP
                <input
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  placeholder="Hospital, colonia, escuela o plaza"
                  value={placeQuery}
                />
              </label>
              <button type="submit">Buscar</button>
              <small>
                Solo busca en municipios aprobados: Pachuca, Mineral de la
                Reforma, Zempoala, Zapotlan, Epazoyucan, Mineral del Monte y
                San Agustin Tlaxiaca.
              </small>
              {placeStatus === "loading" ? <p>Buscando lugares...</p> : null}
              {placeStatus === "short" ? (
                <p>Escribe al menos 3 caracteres.</p>
              ) : null}
              {placeStatus === "empty" ? (
                <p>No encontramos resultados dentro de los municipios aprobados.</p>
              ) : null}
              {placeStatus === "error" ? (
                <p>No se pudo consultar el buscador libre por ahora.</p>
              ) : null}
              {placeResults.length > 0 ? (
                <div className={styles.placeResults}>
                  {placeResults.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => {
                        setSelectedPlace(place);
                        notify({
                          message: `El mapa se movio a ${place.name}.`,
                          title: "Lugar seleccionado",
                          tone: "success",
                        });
                      }}
                      type="button"
                    >
                      <strong>{place.name}</strong>
                      <span>{place.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </form>

            <div className={styles.filterGrid}>
              <label>
                Municipio
                <select
                  onChange={(event) => setMunicipality(event.target.value)}
                  value={municipality}
                >
                  <option>Todas</option>
                  {municipalities.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Estado
                <select
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
              </label>
              <label>
                Tipo
                <select
                  onChange={(event) => setRouteType(event.target.value)}
                  value={routeType}
                >
                  {Object.entries(routeTypeOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.toggles}>
              <label>
                <input
                  checked={onlyFavorites}
                  onChange={(event) => setOnlyFavorites(event.target.checked)}
                  type="checkbox"
                />
                Favoritas
              </label>
              <label>
                <input
                  checked={onlyWithPhotos}
                  onChange={(event) => setOnlyWithPhotos(event.target.checked)}
                  type="checkbox"
                />
                Con fotos
              </label>
              <label>
                <input
                  checked={showStations}
                  onChange={(event) => setShowStations(event.target.checked)}
                  type="checkbox"
                />
                Estaciones Tuzobus
              </label>
              <label>
                <input
                  checked={showRecharge}
                  onChange={(event) => setShowRecharge(event.target.checked)}
                  type="checkbox"
                />
                Recargas
              </label>
              <label>
                <input
                  checked={sortNearby}
                  onChange={(event) => {
                    setSortNearby(event.target.checked);
                    notify({
                      message:
                        event.target.checked && !userPosition
                          ? "Primero usa el boton de ubicacion del mapa para ordenar por cercania."
                          : event.target.checked
                            ? "Las rutas se ordenaran por cercania."
                            : "Se desactivo el orden por cercania.",
                      title: "Orden actualizado",
                      tone:
                        event.target.checked && !userPosition
                          ? "warning"
                          : "info",
                    });
                  }}
                  type="checkbox"
                />
                Ordenar cerca de mi
              </label>
            </div>

            <div className={styles.actions}>
              <button onClick={selectFilteredRoutes} type="button">
                Ver filtradas
              </button>
              <button
                onClick={() => {
                  setSelectedRouteIds([]);
                  notify({
                    message: "Se limpio la seleccion del mapa.",
                    title: "Seleccion limpia",
                    tone: "success",
                  });
                }}
                type="button"
              >
                Limpiar
              </button>
            </div>

            <p className={styles.counter}>
              {filteredRoutes.length} rutas encontradas - {selectedRoutes.length}{" "}
              seleccionadas
            </p>
            </div>
          </div>

        <div
          className={`${styles.routePicker} ${
            routePanelMode === "collapsed" ? styles.collapsed : ""
          } ${routePanelMode === "maximized" ? styles.maximized : ""}`}
        >
          <div className={styles.routeHeader}>
            <h3>Rutas</h3>
            <div>
              <button
                onClick={() =>
                  setRoutePanelMode((current) =>
                    current === "collapsed" ? "normal" : "collapsed"
                  )
                }
                type="button"
              >
                {routePanelMode === "collapsed" ? "Expandir" : "Contraer"}
              </button>
              <button
                onClick={() =>
                  setRoutePanelMode((current) =>
                    current === "maximized" ? "normal" : "maximized"
                  )
                }
                type="button"
              >
                {routePanelMode === "maximized" ? "Normal" : "Maximizar"}
              </button>
            </div>
          </div>
          <div className={styles.routeList}>
            {filteredRoutes.slice(0, 80).map((route) => (
              <article className={styles.routeOption} key={route.id}>
                <label>
                  <input
                    checked={selectedRouteIds.includes(route.id)}
                    onChange={() => toggleRoute(route.id)}
                    type="checkbox"
                  />
                </label>
                <span style={{ "--route-color": route.color || "#00C2A8" }} />
                <div>
                  <strong>{route.name}</strong>
                  <small>
                    {route.sourceLabel} -{" "}
                    {externalRouteTypes[route.routeType] || "Combi"}
                  </small>
                  {userPosition ? (
                    <small>
                      Cerca de ti:{" "}
                      {formatRouteDistance(getRouteDistanceFromUser(route, userPosition))}
                    </small>
                  ) : null}
                </div>
                <div className={styles.routeOptionTools}>
                  <button
                    aria-pressed={favoriteSet.has(route.id)}
                    onClick={() => handleFavorite(route.id)}
                    type="button"
                  >
                    {favoriteSet.has(route.id) ? "Guardada" : "Favorita"}
                  </button>
                  <button onClick={() => copyRouteLink(route.id)} type="button">
                    {copiedRouteId === route.id ? "Copiado" : "Link"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.intersections}>
          <h3>Cruces para transbordo</h3>
          {selectedRoutes.length < 2 ? (
            <p>Selecciona dos o mas rutas para buscar puntos cercanos.</p>
          ) : intersections.length === 0 ? (
            <p>No encontramos cruces cercanos con el umbral actual.</p>
          ) : (
            <ol>
              {intersections.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <strong>{item.routeNames.join(" + ")}</strong>
                  <span>Aprox. {item.distanceMeters} m entre trazos</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <MapLegend />
        </div>
      </aside>

      <div className={styles.mapWrap}>
        <button
          className={styles.fullscreenButton}
          onClick={() => {
            setIsMapFullscreen(!isMapFullscreen);
            notify({
              message: isMapFullscreen
                ? "El mapa regreso a la vista normal."
                : "El mapa ahora ocupa toda la pantalla.",
              title: isMapFullscreen ? "Vista normal" : "Mapa completo",
              tone: "info",
            });
          }}
          type="button"
        >
          {isMapFullscreen ? "Salir" : "Pantalla completa"}
        </button>
        <MapContainer
          attributionControl={false}
          center={PACHUCA_CENTER}
          maxBounds={ZMP_BOUNDS}
          maxBoundsViscosity={1}
          maxZoom={MAX_ZOOM}
          minZoom={MIN_ZOOM}
          scrollWheelZoom={false}
          zoom={INITIAL_ZOOM}
        >
          <CtrlWheelZoom />
          <MapResizeWatcher watch={isMapFullscreen} />
          <LocateButton onLocated={setUserPosition} />
          <MapFocus place={selectedPlace} />
          <div className={styles.zoomHint}>Ctrl + scroll para hacer zoom</div>

          <TileLayer
            maxZoom={MAX_ZOOM}
            minZoom={MIN_ZOOM}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Rectangle
            bounds={ZMP_BOUNDS}
            pathOptions={{
              color: "#102A43",
              dashArray: "8 8",
              fillColor: "#00C2A8",
              fillOpacity: 0.04,
              weight: 2,
            }}
          />

          {visibleRoutes.map((route) => (
            <GeoJSON
              data={route.geojson}
              key={route.id}
              style={{
                color: route.color || "#00C2A8",
                opacity: selectedRouteIds.includes(route.id) ? 0.98 : 0.38,
                weight: selectedRouteIds.includes(route.id) ? 6 : 4,
              }}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3>{route.name}</h3>
                  <p>
                    {route.origin} {"->"} {route.destination}
                  </p>
                  <StatusPill status={route.status} />
                  <dl>
                    <div>
                      <dt>Frecuencia</dt>
                      <dd>{route.frequency || "Por confirmar"}</dd>
                    </div>
                    <div>
                      <dt>Costo</dt>
                      <dd>{route.fare || "Por confirmar"}</dd>
                    </div>
                  </dl>
                </div>
              </Popup>
            </GeoJSON>
          ))}

          {visiblePoints.map((point) => (
            <CircleMarker
              center={[point.lat, point.lng]}
              color={point.type === "station" ? "#7A1230" : "#FFD23F"}
              fillColor={point.type === "station" ? "#7A1230" : "#FFD23F"}
              fillOpacity={0.9}
              key={point.id}
              radius={point.type === "station" ? 6 : 5}
              weight={2}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3>{point.name}</h3>
                  <p>{point.subtitle}</p>
                  <p>{point.address}</p>
                  {point.photos?.[0] ? (
                    <img alt={point.name} loading="lazy" src={point.photos[0]} />
                  ) : null}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {userPosition ? (
            <CircleMarker
              center={[userPosition.lat, userPosition.lng]}
              color="#0B5FFF"
              fillColor="#0B5FFF"
              fillOpacity={0.92}
              radius={9}
              weight={4}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3>Tu ubicacion actual</h3>
                  <p>
                    Precision aproximada:{" "}
                    {Math.round(userPosition.accuracy || 0)} m.
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ) : null}

          {selectedPlace ? (
            <CircleMarker
              center={[selectedPlace.lat, selectedPlace.lng]}
              color="#111827"
              fillColor="#FFD23F"
              fillOpacity={0.95}
              radius={10}
              weight={3}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3>{selectedPlace.name}</h3>
                  <p>{selectedPlace.label}</p>
                </div>
              </Popup>
            </CircleMarker>
          ) : null}

          {intersections.map((item) => (
            <CircleMarker
              center={[item.coordinates[1], item.coordinates[0]]}
              color="#102A43"
              fillColor="#FF5C39"
              fillOpacity={0.95}
              key={item.id}
              radius={8}
              weight={3}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3>Posible transbordo</h3>
                  <p>{item.routeNames.join(" + ")}</p>
                  <p>Aprox. {item.distanceMeters} m entre trazos.</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
