const UNKNOWN_VALUES = new Set([
  "",
  "n/a",
  "na",
  "por confirmar",
  "sin dato",
  "no disponible",
]);

const QUALITY_FIELDS = [
  ["origin", "origen"],
  ["destination", "destino"],
  ["passesThrough", "puntos por donde pasa"],
  ["estimatedTime", "tiempo estimado"],
  ["fare", "costo"],
  ["frequency", "frecuencia"],
  ["schedule", "horario"],
  ["municipalities", "municipios"],
];

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  const normalizedValue = String(value || "").trim().toLowerCase();
  return !UNKNOWN_VALUES.has(normalizedValue);
}

function collectCoordinates(geometry, results = []) {
  if (!geometry) return results;

  if (Array.isArray(geometry) && typeof geometry[0] === "number") {
    results.push(geometry);
    return results;
  }

  if (Array.isArray(geometry)) {
    geometry.forEach((item) => collectCoordinates(item, results));
    return results;
  }

  collectCoordinates(geometry.coordinates, results);
  return results;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKmBetween(firstPoint, secondPoint) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(secondPoint.lat - firstPoint.lat);
  const deltaLng = toRadians(secondPoint.lng - firstPoint.lng);
  const lat1 = toRadians(firstPoint.lat);
  const lat2 = toRadians(secondPoint.lat);
  const value =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function getRouteQuality(route) {
  const missingFields = QUALITY_FIELDS.filter(([field]) => !hasValue(route[field])).map(
    ([, label]) => label
  );
  const completedFields = QUALITY_FIELDS.length - missingFields.length;
  const score = Math.round((completedFields / QUALITY_FIELDS.length) * 100);

  if (score >= 88) {
    return {
      label: "Completa",
      tone: "complete",
      score,
      missingFields,
    };
  }

  if (score >= 62) {
    return {
      label: "Utilizable",
      tone: "partial",
      score,
      missingFields,
    };
  }

  return {
    label: "Requiere revision",
    tone: "review",
    score,
    missingFields,
  };
}

export function getRouteDistanceFromUser(route, userPosition) {
  if (!route?.geojson || !userPosition) return null;

  const coordinates = route.geojson.features
    .flatMap((feature) => collectCoordinates(feature.geometry))
    .filter(([lng, lat]) => Number.isFinite(lat) && Number.isFinite(lng));

  if (coordinates.length === 0) return null;

  const userPoint = { lat: userPosition.lat, lng: userPosition.lng };
  const nearestDistance = coordinates.reduce((nearest, [lng, lat]) => {
    const nextDistance = getDistanceKmBetween(userPoint, { lat, lng });
    return Math.min(nearest, nextDistance);
  }, Number.POSITIVE_INFINITY);

  return Number.isFinite(nearestDistance) ? nearestDistance : null;
}

export function formatRouteDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return "Sin ubicacion";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

export function getRouteShareHref(routeId, target = "/mapa") {
  const params = new URLSearchParams({ rutas: routeId });
  return `${target}?${params.toString()}`;
}

export function buildRouteReportText(route) {
  const quality = getRouteQuality(route);
  const missingText =
    quality.missingFields.length > 0
      ? quality.missingFields.join(", ")
      : "sin campos faltantes detectados";

  return [
    `Reporte de cambio para Mi Combi`,
    `Ruta: ${route.name}`,
    `Origen: ${route.origin || "Por confirmar"}`,
    `Destino: ${route.destination || "Por confirmar"}`,
    `Costo actual: ${route.fare || "Por confirmar"}`,
    `Frecuencia: ${route.frequency || "Por confirmar"}`,
    `Horario: ${route.schedule || "Por confirmar"}`,
    `Fuente: ${route.sourceLabel || "Por confirmar"}`,
    `Calidad de datos: ${quality.label} (${quality.score}%)`,
    `Hace falta revisar: ${missingText}`,
    ``,
    `Cambio observado:`,
  ].join("\n");
}

export function getRouteTypeLabel(route, typeLabels = {}) {
  return typeLabels[route.routeType] || "Combi";
}
