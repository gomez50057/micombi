export function getRouteCoordinates(route) {
  const features =
    route.geojson?.type === "FeatureCollection"
      ? route.geojson.features
      : [route.geojson];

  return features.flatMap((feature) => {
    const geometry = feature?.geometry;

    if (geometry?.type === "LineString") return geometry.coordinates || [];
    if (geometry?.type === "MultiLineString") {
      return (geometry.coordinates || []).flat();
    }

    return [];
  });
}

export function haversineMeters([lngA, latA], [lngB, latB]) {
  const earthRadius = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(latA)) *
      Math.cos(toRadians(latB)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearbyRouteIntersections(
  routes,
  thresholdMeters = 90,
  options = {}
) {
  const intersections = [];
  const indexedRoutes = routes.map((route) => ({
    route,
    coordinates: sampleCoordinates(getRouteCoordinates(route)),
  }));
  const getRouteKey = options.getRouteKey || ((route) => route.id);

  for (let i = 0; i < indexedRoutes.length; i += 1) {
    for (let j = i + 1; j < indexedRoutes.length; j += 1) {
      const first = indexedRoutes[i];
      const second = indexedRoutes[j];

      if (getRouteKey(first.route) === getRouteKey(second.route)) {
        continue;
      }

      for (const firstCoord of first.coordinates) {
        for (const secondCoord of second.coordinates) {
          const distance = haversineMeters(firstCoord, secondCoord);

          if (distance <= thresholdMeters) {
            const midpoint = [
              (firstCoord[0] + secondCoord[0]) / 2,
              (firstCoord[1] + secondCoord[1]) / 2,
            ];

            const duplicate = intersections.some(
              (item) =>
                item.routeIds.includes(first.route.id) &&
                item.routeIds.includes(second.route.id) &&
                haversineMeters(item.coordinates, midpoint) < 180
            );

            if (!duplicate) {
              intersections.push({
                id: `${first.route.id}-${second.route.id}-${intersections.length}`,
                routeIds: [first.route.id, second.route.id],
                routeNames: [first.route.name, second.route.name],
                coordinates: midpoint,
                distanceMeters: Math.round(distance),
              });
            }
          }

          if (intersections.length >= 60) return intersections;
        }
      }
    }
  }

  return intersections;
}

function sampleCoordinates(coordinates) {
  if (coordinates.length <= 140) return coordinates;

  const step = Math.ceil(coordinates.length / 140);

  return coordinates.filter((_, index) => index % step === 0);
}
