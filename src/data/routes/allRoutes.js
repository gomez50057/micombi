import { externalRoutes } from "@/data/generated/externalRoutes";
import { getRouteFare } from "@/data/transportConfig";
import { pachucaInfoRoutes } from "./pachucaInfoRoutes";
import { tuzobusTroncalRoutes } from "./tuzobusTroncal1Routes";

function normalizeRoute(route) {
  return {
    ...route,
    fare: getRouteFare(route),
  };
}

const externalRoutesWithoutLegacyTroncales = externalRoutes.filter(
  (route) => route.routeType !== "tuzobus_troncal"
);

export const allRoutes = [
  ...externalRoutesWithoutLegacyTroncales,
  ...tuzobusTroncalRoutes,
  ...pachucaInfoRoutes,
].map(normalizeRoute);
