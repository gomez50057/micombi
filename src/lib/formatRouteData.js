export function formatRoutePlaces(route) {
  return (route.passesThrough || []).join(" -> ");
}

export function getRouteStatusLabel(statuses, status) {
  return statuses[status]?.label || status || "Por confirmar";
}
