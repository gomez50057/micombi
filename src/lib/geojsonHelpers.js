export function buildRouteGeoJSON({
  routeName,
  routeDescription,
  mainMunicipality,
  points,
}) {
  return {
    type: "Feature",
    properties: {
      name: routeName || "Ruta sin nombre",
      description: routeDescription || "",
      municipality: mainMunicipality || "",
      source: "manual_draw",
      status: "preliminary",
      createdAt: new Date().toISOString(),
    },
    geometry: {
      type: "LineString",
      coordinates: points.map((point) => [point.lng, point.lat]),
    },
  };
}
