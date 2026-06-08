export const transportFares = {
  combiBase: "$12",
  combiBaseLabel: "$12 tarifa base",
  combiDistanceLabel: "Desde $12, segun distancia",
  tuzobusBase: "$10",
  tuzobusBaseLabel: "$10 aprox.",
  updatedAt: "2026-05-06",
};

export function getRouteFare(route) {
  if (route.routeType === "tuzobus_troncal" || route.routeType === "tuzobus_alimentadora") {
    return route.fare || transportFares.tuzobusBaseLabel;
  }

  if (route.routeType === "combi") {
    const rawFare = String(route.fare || "").trim();
    const hasDistanceRange = /-|a|segun|distancia/i.test(rawFare);

    return hasDistanceRange
      ? transportFares.combiDistanceLabel
      : transportFares.combiBaseLabel;
  }

  return route.fare || "Por confirmar";
}
