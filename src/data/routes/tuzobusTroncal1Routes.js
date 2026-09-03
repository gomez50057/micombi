import { tuzobusTroncalGeojson } from "@/data/generated/tuzobusTroncalGeojson";

const STATION_MATCH_RADIUS_METERS = 120;

const routeConfigurations = {
  1: {
    origin: "Terminal Téllez",
    destination: "Presidente Alemán",
    colors: { ida: "#15803d", vuelta: "#86efac" },
  },
  2: {
    origin: "Matilde",
    destination: "Presidente Alemán",
    colors: { ida: "#7e22ce", vuelta: "#c084fc" },
  },
  4: {
    origin: "Matilde",
    destination: "Centro Histórico",
    colors: { ida: "#ea580c", vuelta: "#fdba74" },
  },
  5: {
    origin: "Terminal Téllez",
    destination: "Centro Histórico",
    colors: { ida: "#dc2626", vuelta: "#fca5a5" },
  },
};

const stationFeatures = tuzobusTroncalGeojson.stations.features || [];

export const tuzobusTroncalPoints = stationFeatures
  .filter((feature) => feature.geometry?.type === "Point")
  .map((feature) => ({
    ...feature.properties,
    id: feature.properties.id,
    type: feature.properties.type || "station",
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    source: "qgis_tuzobus_troncal",
  }));

function getStationCandidates(stationId) {
  if (stationId === "station-01") {
    return stationFeatures.filter((feature) =>
      /^station-01-(salida|arribo)$/i.test(feature.properties.id)
    );
  }

  return stationFeatures.filter(
    (feature) => feature.properties.id === stationId
  );
}

function getMetersPerDegree(latitude) {
  return {
    latitude: 111320,
    longitude: 111320 * Math.cos((latitude * Math.PI) / 180),
  };
}

function distanceToSegmentMeters(point, start, end) {
  const meters = getMetersPerDegree(point[1]);
  const pointX = point[0] * meters.longitude;
  const pointY = point[1] * meters.latitude;
  const startX = start[0] * meters.longitude;
  const startY = start[1] * meters.latitude;
  const endX = end[0] * meters.longitude;
  const endY = end[1] * meters.latitude;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const lengthSquared = deltaX ** 2 + deltaY ** 2;
  const progress = lengthSquared
    ? Math.max(
        0,
        Math.min(
          1,
          ((pointX - startX) * deltaX + (pointY - startY) * deltaY) /
            lengthSquared
        )
      )
    : 0;
  const closestX = startX + progress * deltaX;
  const closestY = startY + progress * deltaY;

  return Math.hypot(pointX - closestX, pointY - closestY);
}

function distanceToGeometryMeters(point, geometry) {
  if (!geometry) return Number.POSITIVE_INFINITY;

  if (geometry.type === "LineString") {
    return geometry.coordinates.slice(1).reduce((closestDistance, end, index) => {
      return Math.min(
        closestDistance,
        distanceToSegmentMeters(point, geometry.coordinates[index], end)
      );
    }, Number.POSITIVE_INFINITY);
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.reduce(
      (closestDistance, line) =>
        Math.min(
          closestDistance,
          distanceToGeometryMeters(point, {
            type: "LineString",
            coordinates: line,
          })
        ),
      Number.POSITIVE_INFINITY
    );
  }

  return Number.POSITIVE_INFINITY;
}

function getClosestStation(stationId, geometry) {
  return getStationCandidates(stationId)
    .map((feature) => ({
      feature,
      distance: distanceToGeometryMeters(
        feature.geometry.coordinates,
        geometry
      ),
    }))
    .sort((first, second) => first.distance - second.distance)[0];
}

function getStationIds(feature) {
  const sourceStationIds = String(feature.properties?.stationIds || "")
    .split(",")
    .map((stationId) => stationId.trim())
    .filter(Boolean);
  const stationIds = [];

  sourceStationIds.forEach((stationId) => {
    const closestStation = getClosestStation(stationId, feature.geometry);
    if (
      !closestStation ||
      closestStation.distance > STATION_MATCH_RADIUS_METERS
    ) {
      return;
    }

    const actualStationId = closestStation.feature.properties.id;
    if (!stationIds.includes(actualStationId)) {
      stationIds.push(actualStationId);
    }
  });

  return stationIds;
}

function getStationNames(stationIds) {
  return stationIds
    .map((stationId) =>
      stationFeatures.find((feature) => feature.properties.id === stationId)
    )
    .filter(Boolean)
    .map((feature) => feature.properties.name);
}

function getRouteNumberAndDirection(routeKey) {
  const match = routeKey.match(/^troncal(\d+)-(ida|vuelta)$/);
  return match ? { number: match[1], direction: match[2] } : null;
}

function createRoute(routeKey, featureCollection) {
  const routeInfo = getRouteNumberAndDirection(routeKey);
  const feature = featureCollection?.features?.[0];
  const configuration = routeInfo && routeConfigurations[routeInfo.number];

  if (!routeInfo || !feature || !configuration) return null;

  const { direction, number } = routeInfo;
  const isReturn = direction === "vuelta";
  const routeId =
    number === "1"
      ? `rutashidalgo-tbtroncal1-1${isReturn ? "-vuelta" : ""}`
      : `tuzobus-troncal${number}-${direction}`;
  const stationIds = getStationIds(feature);
  const origin = isReturn ? configuration.destination : configuration.origin;
  const destination = isReturn ? configuration.origin : configuration.destination;

  return {
    id: routeId,
    externalId: feature.properties.externalId || routeId,
    name: `Tuzobus Troncal ${number} (${direction})`,
    origin,
    destination,
    municipalities:
      number === "1" || number === "5"
        ? ["Pachuca de Soto", "Zempoala"]
        : ["Pachuca de Soto"],
    passesThrough: getStationNames(stationIds),
    estimatedTime: "Por confirmar",
    fare: "$10 aprox.",
    frequency: "Por confirmar",
    schedule:
      "Lunes a Viernes de 05:30 a 22:30 hrs, Sabados de 06:00 a 22:00 hrs y Domingo de 7:00 a 22:00 hrs",
    status: feature.properties.status || "preliminary",
    source: "mapa_rutas_qgis",
    sourceLabel: "Mapa de rutas (QGIS)",
    sourceUrl: "",
    routeType: "tuzobus_troncal",
    color: configuration.colors[direction],
    notes:
      "Trazo preliminar cargado desde public/data/geojson/tuzobus-troncal. Las estaciones visibles se ajustan a los puntos del archivo de estaciones y al trazo de cada sentido.",
    updatedAt: "2026-09-03",
    stationIds,
    geojson: {
      ...featureCollection,
      features: featureCollection.features.map((routeFeature) => ({
        ...routeFeature,
        properties: {
          ...routeFeature.properties,
          routeId,
          externalId: feature.properties.externalId || routeId,
          name: `Tuzobus Troncal ${number} (${direction})`,
          direction,
          stationIds: stationIds.join(","),
          stationCount: stationIds.length,
        },
      })),
    },
  };
}

export const tuzobusTroncalRoutes = Object.entries(
  tuzobusTroncalGeojson.routes
)
  .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
  .map(([routeKey, featureCollection]) =>
    createRoute(routeKey, featureCollection)
  )
  .filter(Boolean);

export const tuzobusTroncal1Routes = tuzobusTroncalRoutes;
