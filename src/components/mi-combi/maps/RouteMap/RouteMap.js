"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { divIcon } from "leaflet";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { allRoutes } from "@/data/routes/allRoutes";
import {
  externalRoutes,
  externalRouteTypes,
} from "@/data/generated/externalRoutes";
import { tuzobusPoints } from "@/data/generated/tuzobusPoints";
import { municipalities } from "@/data/municipalities";
import { routeStatuses } from "@/data/routeStatuses";
import { tuzobusTroncalPoints } from "@/data/routes/tuzobusTroncal1Routes";
import {
  findNearbyRouteIntersections,
  getRouteCoordinates,
} from "@/lib/mapAnalysis";
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
const MAP_PAN_BOUNDS = [
  [19.78, -99.16],
  [20.44, -98.32],
];
const NOMINATIM_VIEWBOX = "-98.96,20.28,-98.52,19.94";
const mappableRoutes = allRoutes.filter((route) => route.geojson);

function getCoordinateAtProgress(coordinates, progress) {
  if (coordinates.length === 0) return null;
  if (coordinates.length === 1) return coordinates[0];

  const segments = coordinates.slice(1).map((coordinate, index) => {
    const previous = coordinates[index];
    return {
      coordinate,
      length: Math.hypot(
        coordinate[0] - previous[0],
        coordinate[1] - previous[1]
      ),
    };
  });
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const targetLength = totalLength * progress;
  let coveredLength = 0;

  for (const [index, segment] of segments.entries()) {
    const previous = coordinates[index];
    if (coveredLength + segment.length >= targetLength) {
      const segmentProgress = segment.length
        ? (targetLength - coveredLength) / segment.length
        : 0;
      return [
        previous[0] + (segment.coordinate[0] - previous[0]) * segmentProgress,
        previous[1] + (segment.coordinate[1] - previous[1]) * segmentProgress,
      ];
    }
    coveredLength += segment.length;
  }

  return coordinates[coordinates.length - 1];
}

const alimentadoraPoints = externalRoutes
  .filter((route) => route.routeType === "tuzobus_alimentadora")
  .flatMap((route) => {
    const coordinates = getRouteCoordinates(route);
    const stopNames = route.passesThrough?.length
      ? route.passesThrough
      : [route.origin, route.destination].filter(Boolean);

    return stopNames.map((stopName, index) => {
      const progress = stopNames.length > 1 ? index / (stopNames.length - 1) : 0;
      const coordinate = getCoordinateAtProgress(coordinates, progress);

      if (!coordinate) return null;

      return {
        id: `${route.id}-parada-${index + 1}`,
        type: "parada",
        name: `Parada ${index + 1}`,
        subtitle: route.name,
        address: stopName,
        routeId: route.id,
        source: route.source,
        lat: coordinate[1],
        lng: coordinate[0],
      };
    });
  })
  .filter(Boolean);

const mapPoints = [
  ...tuzobusPoints.filter((point) => point.type !== "station"),
  ...tuzobusTroncalPoints,
  ...alimentadoraPoints,
];
const defaultSelectedRouteIds = mappableRoutes
  .filter((route) => route.routeType === "combi")
  .slice(0, 6)
  .map((route) => route.id);

const routeTreeGroups = [
  {
    key: "troncal",
    label: "Troncal",
    routeType: "tuzobus_troncal",
    pointTypes: ["station", "recharge"],
  },
  {
    key: "alimentadoras",
    label: "Alimentadoras",
    routeType: "tuzobus_alimentadora",
    pointTypes: ["stop", "parada"],
  },
  {
    key: "combis",
    label: "Combis",
    routeType: "combi",
    pointTypes: [],
  },
];

const pointTypeLabels = {
  parada: "Parada alimentadora",
  recharge: "Punto de recarga",
  station: "Estacion troncal",
  stop: "Parada alimentadora",
};

const pointMarkerSvg = {
  parada:
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  recharge:
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 3h8v8H8z"/><path d="M10 11v7a3 3 0 1 0 6 0v-1h2"/><path d="M18 7v5"/></svg>',
  station:
    '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="15" rx="3"/><path d="M9 7h6M9 11h6M9 21l2-3M15 18l2 3"/></svg>',
  stop:
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
};

function getRouteDirection(route) {
  const text = `${route.id} ${route.name}`.toLowerCase();

  if (/(^|[-\s(])ida($|[-\s)])/.test(text)) {
    return "ida";
  }

  if (/(^|[-\s(])vuelta($|[-\s)])/.test(text)) {
    return "vuelta";
  }

  return "unico";
}

function getRouteBaseName(route) {
  return route.name.replace(/\s*\((ida|vuelta)\)\s*$/i, "").trim();
}

function getRouteBaseKey(route) {
  return route.id.replace(/-(ida|vuelta)$/i, "");
}

function groupRoutesByBase(routes) {
  const routeFamilies = new Map();

  routes.forEach((route) => {
    const baseKey = getRouteBaseKey(route);
    const currentFamily = routeFamilies.get(baseKey) || {
      id: baseKey,
      name: getRouteBaseName(route),
      routes: [],
    };

    currentFamily.routes.push({
      ...route,
      direction: getRouteDirection(route),
      displayName: getRouteBaseName(route),
    });
    routeFamilies.set(baseKey, currentFamily);
  });

  return Array.from(routeFamilies.values()).map((family) => ({
    ...family,
    routes: family.routes.sort((first, second) => {
      const order = { ida: 0, vuelta: 1, unico: 2 };
      return order[first.direction] - order[second.direction];
    }),
  }));
}

function routeUsesStations(route) {
  return route?.routeType === "tuzobus_troncal" && route.stationIds?.length > 0;
}

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

function RouteBoundsFocus({ focusKey, routes }) {
  const map = useMap();

  useEffect(() => {
    if (!focusKey || routes.length === 0) return;

    const routeCoordinates = routes.flatMap((route) =>
      getRouteCoordinates(route).map(([lng, lat]) => [lat, lng])
    );

    if (routeCoordinates.length === 0) return;

    if (routeCoordinates.length === 1) {
      map.setView(routeCoordinates[0], USER_LOCATION_ZOOM, { animate: true });
      return;
    }

    map.fitBounds(routeCoordinates, {
      animate: true,
      maxZoom: 16,
      padding: [36, 36],
    });
  }, [focusKey, map, routes]);

  return null;
}

function SidebarToggleIcon({ expanded }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
      <path d={expanded ? "m15 9-3 3 3 3" : "m12 9 3 3-3 3"} />
    </svg>
  );
}

function PanelSizeIcon({ maximized }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      {maximized ? (
        <>
          <path d="M9 4v6H3" />
          <path d="M15 4v6h6" />
          <path d="M9 20v-6H3" />
          <path d="M15 20v-6h6" />
        </>
      ) : (
        <>
          <path d="M4 9V4h5" />
          <path d="M20 9V4h-5" />
          <path d="M4 15v5h5" />
          <path d="M20 15v5h-5" />
        </>
      )}
    </svg>
  );
}

function RouteTreeIcon({ type }) {
  if (type === "tuzobus_troncal") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <rect x="6" y="3" width="12" height="15" rx="3" />
        <path d="M9 7h6M9 11h6M9 21l2-3M15 18l2 3" />
      </svg>
    );
  }

  if (type === "tuzobus_alimentadora") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M7 5h10a3 3 0 0 1 3 3v8H4V8a3 3 0 0 1 3-3Z" />
      <path d="M7 9h10M7 16v3M17 16v3" />
      <circle cx="8" cy="13" r="1.2" />
      <circle cx="16" cy="13" r="1.2" />
    </svg>
  );
}

function RouteGroupChevron({ expanded }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d={expanded ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

function CtrlWheelZoom({ onWheelHint }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const handleWheel = (event) => {
      onWheelHint();
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
  }, [map, onWheelHint]);

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

function LocateRequestHandler({ requestKey, onLocated }) {
  const map = useMap();

  useEffect(() => {
    if (requestKey === 0) return;

    if (!navigator.geolocation) {
      notify({
        message: "Tu navegador no permite usar ubicacion.",
        title: "Ubicacion no disponible",
        tone: "warning",
      });
      return;
    }

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
        notify({
          message: "El mapa se centro en tu ubicacion actual.",
          title: "Ubicacion lista",
          tone: "success",
        });
      },
      () => {
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
  }, [map, onLocated, requestKey]);

  return null;
}

export default function RouteMap() {
  const [query, setQuery] = useState("");
  const [municipality, setMunicipality] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortNearby, setSortNearby] = useState(false);
  const [showStations, setShowStations] = useState(false);
  const [showStops, setShowStops] = useState(false);
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
  const [showZoomHint, setShowZoomHint] = useState(false);
  const [locateRequestKey, setLocateRequestKey] = useState(0);
  const [selectedRouteIds, setSelectedRouteIds] = useState(() =>
    defaultSelectedRouteIds
  );
  const [routeFocusRequest, setRouteFocusRequest] = useState({
    ids: [],
    key: 0,
  });
  const [expandedRouteGroups, setExpandedRouteGroups] = useState({
    alimentadoras: true,
    combis: true,
    troncal: true,
  });
  const [urlParamsReady, setUrlParamsReady] = useState(false);
  const zoomHintTimerRef = useRef(null);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const selectedRouteSet = useMemo(
    () => new Set(selectedRouteIds),
    [selectedRouteIds]
  );

  const showMapZoomHint = () => {
    setShowZoomHint(true);

    if (zoomHintTimerRef.current) {
      window.clearTimeout(zoomHintTimerRef.current);
    }

    zoomHintTimerRef.current = window.setTimeout(() => {
      setShowZoomHint(false);
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (zoomHintTimerRef.current) {
        window.clearTimeout(zoomHintTimerRef.current);
      }
    };
  }, []);

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
          if (
            routeIds.some((routeId) =>
              routeUsesStations(mappableRoutes.find((route) => route.id === routeId))
            )
          ) {
            setShowStations(true);
          }
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

  useEffect(() => {
    if (!isMapFullscreen) return undefined;

    const closeFullscreenWithEsc = (event) => {
      if (event.key !== "Escape") return;

      setIsMapFullscreen(false);
      notify({
        message: "El mapa regreso a la vista normal.",
        title: "Vista normal",
        tone: "info",
      });
    };

    window.addEventListener("keydown", closeFullscreenWithEsc);

    return () => {
      window.removeEventListener("keydown", closeFullscreenWithEsc);
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
      const matchesStatus =
        route.routeType !== "combi" ||
        status === "Todos" ||
        route.status === status;
      const matchesFavorites = !onlyFavorites || favoriteSet.has(route.id);

      return (
        matchesQuery &&
        matchesMunicipality &&
        matchesStatus &&
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
    query,
    sortNearby,
    status,
    userPosition,
  ]);

  const selectedRoutes = useMemo(() => {
    return mappableRoutes.filter((route) => selectedRouteSet.has(route.id));
  }, [selectedRouteSet]);

  const selectedStationIds = useMemo(() => {
    return new Set(
      selectedRoutes
        .filter(routeUsesStations)
        .flatMap((route) => route.stationIds)
    );
  }, [selectedRoutes]);

  const selectedAlimentadoraRouteIds = useMemo(() => {
    return new Set(
      selectedRoutes
        .filter((route) => route.routeType === "tuzobus_alimentadora")
        .map((route) => route.id)
    );
  }, [selectedRoutes]);

  const routeFocusRoutes = useMemo(() => {
    const focusSet = new Set(routeFocusRequest.ids);
    return mappableRoutes.filter((route) => focusSet.has(route.id));
  }, [routeFocusRequest.ids]);

  const routeGroups = useMemo(
    () =>
      routeTreeGroups.map((group) => {
        const routes = filteredRoutes.filter(
          (route) => route.routeType === group.routeType
        );

        return {
          ...group,
          families: groupRoutesByBase(routes),
          routes,
        };
      }),
    [filteredRoutes]
  );
  const filteredTreeRouteIds = useMemo(
    () => routeGroups.flatMap((group) => group.routes.map((route) => route.id)),
    [routeGroups]
  );
  const isWholeRouteTreeSelected =
    filteredTreeRouteIds.length > 0 &&
    filteredTreeRouteIds.every((routeId) => selectedRouteSet.has(routeId));

  const visibleRoutes =
    selectedRoutes.length > 0
      ? selectedRoutes
      : filteredRoutes.slice(0, MAX_VISIBLE_ROUTES);

  const intersections = useMemo(
    () =>
      findNearbyRouteIntersections(selectedRoutes, 95, {
        getRouteKey: getRouteBaseKey,
      }),
    [selectedRoutes]
  );

  const visiblePoints = useMemo(() => {
    return mapPoints.filter((point) => {
      if (point.type === "station") {
        return (
          showStations &&
          (selectedStationIds.size === 0 || selectedStationIds.has(point.id))
        );
      }
      if (point.type === "stop" || point.type === "parada") {
        return (
          showStops &&
          (selectedAlimentadoraRouteIds.size === 0 ||
            selectedAlimentadoraRouteIds.has(point.routeId))
        );
      }
      if (point.type === "recharge") return showRecharge;
      return false;
    });
  }, [
    selectedAlimentadoraRouteIds,
    selectedStationIds,
    showRecharge,
    showStations,
    showStops,
  ]);

  const pointIcons = useMemo(
    () => ({
      parada: divIcon({
        className: `${styles.pointMarker} ${styles.stopPointMarker}`,
        html: pointMarkerSvg.parada,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        popupAnchor: [0, -14],
      }),
      recharge: divIcon({
        className: `${styles.pointMarker} ${styles.rechargePointMarker}`,
        html: pointMarkerSvg.recharge,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        popupAnchor: [0, -14],
      }),
      station: divIcon({
        className: `${styles.pointMarker} ${styles.stationPointMarker}`,
        html: pointMarkerSvg.station,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        popupAnchor: [0, -14],
      }),
      stop: divIcon({
        className: `${styles.pointMarker} ${styles.stopPointMarker}`,
        html: pointMarkerSvg.stop,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        popupAnchor: [0, -14],
      }),
    }),
    []
  );

  const focusRoutesOnMap = (routeIds) => {
    if (routeIds.length === 0) return;

    setRouteFocusRequest((current) => ({
      ids: routeIds,
      key: current.key + 1,
    }));
  };

  const toggleRoute = (routeId) => {
    const route = mappableRoutes.find((item) => item.id === routeId);
    const isSelected = selectedRouteIds.includes(routeId);
    setSelectedRouteIds((current) =>
      current.includes(routeId)
        ? current.filter((id) => id !== routeId)
        : [...current, routeId]
    );
    if (!isSelected && routeUsesStations(route)) {
      setShowStations(true);
    }
    if (!isSelected) {
      focusRoutesOnMap([routeId]);
    }
    notify({
      message: isSelected
        ? `${route?.name || "La ruta"} se quito del mapa.`
        : `${route?.name || "La ruta"} se agrego al mapa.`,
      title: isSelected ? "Ruta removida" : "Ruta agregada",
      tone: isSelected ? "warning" : "success",
    });
  };

  const selectFilteredRoutes = () => {
    const nextRouteIds = filteredRoutes
      .slice(0, MAX_VISIBLE_ROUTES)
      .map((route) => route.id);

    setSelectedRouteIds(nextRouteIds);
    if (
      nextRouteIds.some((routeId) =>
        routeUsesStations(mappableRoutes.find((route) => route.id === routeId))
      )
    ) {
      setShowStations(true);
    }
    focusRoutesOnMap(nextRouteIds);
    notify({
      message: `Se seleccionaron hasta ${MAX_VISIBLE_ROUTES} rutas filtradas.`,
      title: "Rutas seleccionadas",
      tone: "success",
    });
  };

  const toggleRouteGroupExpanded = (groupKey) => {
    setExpandedRouteGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

  const enableGroupPoints = (group) => {
    if (group.pointTypes.includes("station")) {
      setShowStations(true);
    }

    if (group.pointTypes.includes("recharge")) {
      setShowRecharge(true);
    }

    if (group.pointTypes.includes("stop") || group.pointTypes.includes("parada")) {
      setShowStops(true);
    }
  };

  const toggleRouteGroup = (group) => {
    const groupRouteIds = group.routes.map((route) => route.id);
    const selectedCount = groupRouteIds.filter((routeId) =>
      selectedRouteSet.has(routeId)
    ).length;
    const isGroupSelected =
      groupRouteIds.length > 0 && selectedCount === groupRouteIds.length;

    setSelectedRouteIds((current) => {
      if (isGroupSelected) {
        const groupRouteSet = new Set(groupRouteIds);
        return current.filter((routeId) => !groupRouteSet.has(routeId));
      }

      const nextRouteSet = new Set(current);
      groupRouteIds.forEach((routeId) => nextRouteSet.add(routeId));
      return Array.from(nextRouteSet);
    });

    if (!isGroupSelected) {
      enableGroupPoints(group);
      focusRoutesOnMap(groupRouteIds);
    }

    notify({
      message: isGroupSelected
        ? `Se apagaron las rutas de ${group.label}.`
        : `Se prendieron ${groupRouteIds.length} rutas de ${group.label}.`,
      title: isGroupSelected ? "Grupo apagado" : "Grupo prendido",
      tone: isGroupSelected ? "warning" : "success",
    });
  };

  const toggleRouteFamily = (family) => {
    const familyRouteIds = family.routes.map((route) => route.id);
    const selectedCount = familyRouteIds.filter((routeId) =>
      selectedRouteSet.has(routeId)
    ).length;
    const isFamilySelected =
      familyRouteIds.length > 0 && selectedCount === familyRouteIds.length;

    setSelectedRouteIds((current) => {
      if (isFamilySelected) {
        const familyRouteSet = new Set(familyRouteIds);
        return current.filter((routeId) => !familyRouteSet.has(routeId));
      }

      const nextRouteSet = new Set(current);
      familyRouteIds.forEach((routeId) => nextRouteSet.add(routeId));
      return Array.from(nextRouteSet);
    });

    notify({
      message: isFamilySelected
        ? `Se apagaron los sentidos de ${family.name}.`
        : `Se prendieron ${familyRouteIds.length} sentidos de ${family.name}.`,
      title: isFamilySelected ? "Ruta apagada" : "Ruta prendida",
      tone: isFamilySelected ? "warning" : "success",
    });

    if (!isFamilySelected) {
      if (family.routes.some(routeUsesStations)) {
        setShowStations(true);
      }
      focusRoutesOnMap(familyRouteIds);
    }
  };

  const toggleWholeRouteTree = () => {
    if (isWholeRouteTreeSelected) {
      const treeRouteSet = new Set(filteredTreeRouteIds);
      setSelectedRouteIds((current) =>
        current.filter((routeId) => !treeRouteSet.has(routeId))
      );
    } else {
      setSelectedRouteIds((current) => {
        const nextRouteSet = new Set(current);
        filteredTreeRouteIds.forEach((routeId) => nextRouteSet.add(routeId));
        return Array.from(nextRouteSet);
      });

      routeGroups.forEach((group) => enableGroupPoints(group));
      focusRoutesOnMap(filteredTreeRouteIds);
    }

    notify({
      message: isWholeRouteTreeSelected
        ? "Se apago el arbol de rutas filtradas."
        : `Se prendio el arbol con ${filteredTreeRouteIds.length} rutas filtradas.`,
      title: isWholeRouteTreeSelected ? "Arbol apagado" : "Arbol prendido",
      tone: isWholeRouteTreeSelected ? "warning" : "success",
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
      } ${sidebarPanelMode === "minimized" ? styles.mapExpanded : ""}`}
    >
      <aside
        className={`${styles.sidebar} ${
          sidebarPanelMode === "minimized" ? styles.minimized : ""
        } ${sidebarPanelMode === "maximized" ? styles.maximizedPanel : ""}`}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <h2>Mapa para planear</h2>
              <p>
                {filteredRoutes.length} rutas encontradas -{" "}
                {selectedRoutes.length} seleccionadas
              </p>
            </div>
            <div className={styles.panelTools}>
              <button
                aria-label={
                  sidebarPanelMode === "minimized"
                    ? "Mostrar panel de planeacion"
                    : "Minimizar panel de planeacion"
                }
                className={styles.iconTool}
                onClick={() =>
                  setSidebarPanelMode((current) =>
                    current === "minimized" ? "normal" : "minimized"
                  )
                }
                title={
                  sidebarPanelMode === "minimized"
                    ? "Mostrar panel"
                    : "Minimizar panel"
                }
                type="button"
              >
                <SidebarToggleIcon expanded={sidebarPanelMode === "minimized"} />
                <span>{sidebarPanelMode === "minimized" ? "Mostrar" : "Minimizar"}</span>
              </button>
              <button
                aria-label={
                  sidebarPanelMode === "maximized"
                    ? "Volver panel a vista normal"
                    : "Maximizar panel de planeacion"
                }
                className={styles.iconTool}
                onClick={() =>
                  setSidebarPanelMode((current) =>
                    current === "maximized" ? "normal" : "maximized"
                  )
                }
                title={
                  sidebarPanelMode === "maximized"
                    ? "Vista normal"
                    : "Maximizar panel"
                }
                type="button"
              >
                <PanelSizeIcon maximized={sidebarPanelMode === "maximized"} />
                <span>{sidebarPanelMode === "maximized" ? "Normal" : "Maximizar"}</span>
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
              <button
                className={styles.locationButton}
                onClick={() => setLocateRequestKey((current) => current + 1)}
                type="button"
              >
                Localizar ubicacion actual
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
                Estado (solo combis)
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
                  checked={showStops}
                  onChange={(event) => setShowStops(event.target.checked)}
                  type="checkbox"
                />
                Paradas alimentadoras
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
                  setShowStations(false);
                  setShowRecharge(false);
                  notify({
                    message:
                      "Se limpiaron las rutas, estaciones y puntos de recarga del mapa.",
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
          <div className={styles.routeQuickActions}>
            <button onClick={toggleWholeRouteTree} type="button">
              {isWholeRouteTreeSelected ? "Apagar arbol" : "Prender arbol"}
            </button>
            <button
              onClick={() => {
                setSelectedRouteIds([]);
                setShowStations(false);
                setShowRecharge(false);
                notify({
                  message:
                    "Se limpiaron las rutas, estaciones y puntos de recarga del mapa.",
                  title: "Rutas limpias",
                  tone: "success",
                });
              }}
              type="button"
            >
              Limpiar rutas
            </button>
          </div>
          <div className={styles.routeTree}>
            {routeGroups.map((group) => {
              const selectedCount = group.routes.filter((route) =>
                selectedRouteSet.has(route.id)
              ).length;
              const isGroupSelected =
                group.routes.length > 0 && selectedCount === group.routes.length;
              const isExpanded = expandedRouteGroups[group.key];

              return (
                <section className={styles.routeGroup} key={group.key}>
                  <div className={styles.routeGroupHeader}>
                    <button
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Contraer ${group.label}`
                          : `Descontraer ${group.label}`
                      }
                      className={styles.routeGroupChevron}
                      onClick={() => toggleRouteGroupExpanded(group.key)}
                      type="button"
                    >
                      <RouteGroupChevron expanded={isExpanded} />
                    </button>
                    <span
                      className={`${styles.routeGroupIcon} ${
                        styles[`${group.key}RouteGroupIcon`]
                      }`}
                    >
                      <RouteTreeIcon type={group.routeType} />
                    </span>
                    <button
                      aria-pressed={isGroupSelected}
                      className={styles.routeGroupToggle}
                      disabled={group.routes.length === 0}
                      onClick={() => toggleRouteGroup(group)}
                      type="button"
                    >
                      <span>
                        <strong>{group.label}</strong>
                        <small>
                          {selectedCount}/{group.routes.length} prendidas
                        </small>
                      </span>
                      <em>{isGroupSelected ? "Apagar" : "Prender"}</em>
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className={styles.routeGroupRoutes}>
                      {group.key === "troncal" ? (
                        <div className={styles.toggles}>
                          <label>
                            <input
                              checked={showStations}
                              onChange={(event) =>
                                setShowStations(event.target.checked)
                              }
                              type="checkbox"
                            />
                            Estaciones Tuzobus
                          </label>
                          <label>
                            <input
                              checked={showRecharge}
                              onChange={(event) =>
                                setShowRecharge(event.target.checked)
                              }
                              type="checkbox"
                            />
                            Recargas
                          </label>
                        </div>
                      ) : null}
                      {group.routes.length > 0 ? (
                        group.families.map((family) => {
                          const familySelectedCount = family.routes.filter((route) =>
                            selectedRouteSet.has(route.id)
                          ).length;
                          const isFamilySelected =
                            family.routes.length > 0 &&
                            familySelectedCount === family.routes.length;

                          return (
                            <article className={styles.routeFamily} key={family.id}>
                              <div className={styles.routeFamilyHeader}>
                                <div>
                                  <strong>{family.name}</strong>
                                  <small>
                                    {familySelectedCount}/{family.routes.length}{" "}
                                    sentidos prendidos
                                  </small>
                                </div>
                                <button
                                  aria-pressed={isFamilySelected}
                                  onClick={() => toggleRouteFamily(family)}
                                  type="button"
                                >
                                  {isFamilySelected ? "Apagar" : "Prender"}
                                </button>
                              </div>

                              <div className={styles.routeDirectionList}>
                                {family.routes.map((route) => (
                                  <article
                                    className={styles.routeOption}
                                    key={route.id}
                                  >
                                    <label>
                                      <input
                                        checked={selectedRouteSet.has(route.id)}
                                        onChange={() => toggleRoute(route.id)}
                                        type="checkbox"
                                      />
                                    </label>
                                    <span
                                      style={{
                                        "--route-color": route.color || "#00C2A8",
                                      }}
                                    />
                                    <div>
                                      <strong>
                                        <span
                                          className={`${styles.directionBadge} ${
                                            styles[`${route.direction}DirectionBadge`]
                                          }`}
                                        >
                                          {route.direction === "ida"
                                            ? "Ida"
                                            : route.direction === "vuelta"
                                              ? "Vuelta"
                                              : "Ruta"}
                                        </span>
                                        {route.name}
                                      </strong>
                                      <small>
                                        {route.sourceLabel} -{" "}
                                        {externalRouteTypes[route.routeType] ||
                                          "Combi"}
                                      </small>
                                      {userPosition ? (
                                        <small>
                                          Cerca de ti:{" "}
                                          {formatRouteDistance(
                                            getRouteDistanceFromUser(
                                              route,
                                              userPosition
                                            )
                                          )}
                                        </small>
                                      ) : null}
                                    </div>
                                    <div className={styles.routeOptionTools}>
                                      <button
                                        aria-pressed={favoriteSet.has(route.id)}
                                        onClick={() => handleFavorite(route.id)}
                                        type="button"
                                      >
                                        {favoriteSet.has(route.id)
                                          ? "Guardada"
                                          : "Favorita"}
                                      </button>
                                      <button
                                        onClick={() => copyRouteLink(route.id)}
                                        type="button"
                                      >
                                        {copiedRouteId === route.id
                                          ? "Copiado"
                                          : "Link"}
                                      </button>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <p className={styles.emptyRouteGroup}>
                          Sin rutas con los filtros actuales.
                        </p>
                      )}
                    </div>
                  ) : null}
                </section>
              );
            })}
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
          maxBounds={MAP_PAN_BOUNDS}
          maxBoundsViscosity={0.45}
          maxZoom={MAX_ZOOM}
          minZoom={MIN_ZOOM}
          scrollWheelZoom={false}
          zoomControl={false}
          zoom={INITIAL_ZOOM}
        >
          <CtrlWheelZoom onWheelHint={showMapZoomHint} />
          <MapResizeWatcher watch={`${isMapFullscreen}-${sidebarPanelMode}`} />
          <ZoomControl position="topright" />
          <LocateButton onLocated={setUserPosition} />
          <LocateRequestHandler
            onLocated={setUserPosition}
            requestKey={locateRequestKey}
          />
          <MapFocus place={selectedPlace} />
          <RouteBoundsFocus
            focusKey={routeFocusRequest.key}
            routes={routeFocusRoutes}
          />
          {showZoomHint ? (
            <div className={styles.zoomHint}>Ctrl + scroll para hacer zoom</div>
          ) : null}

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
            <Marker
              icon={pointIcons[point.type] || pointIcons.stop}
              key={point.id}
              position={[point.lat, point.lng]}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3>{point.name}</h3>
                  <p>{pointTypeLabels[point.type] || "Punto de ruta"}</p>
                  <p>{point.subtitle}</p>
                  <p>{point.address}</p>
                  {point.photos?.[0] ? (
                    <img alt={point.name} loading="lazy" src={point.photos[0]} />
                  ) : null}
                </div>
              </Popup>
            </Marker>
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
