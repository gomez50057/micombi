export function filterRoutesByMunicipality(routes, municipality) {
  if (!municipality || municipality === "Todas") return routes;

  return routes.filter((route) => route.municipalities?.includes(municipality));
}

export function filterRoutesByStatus(routes, status) {
  if (!status || status === "Todos") return routes;

  return routes.filter((route) => route.status === status);
}
