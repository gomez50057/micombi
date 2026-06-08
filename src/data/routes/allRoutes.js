import { externalRoutes } from "@/data/generated/externalRoutes";
import { getRouteFare } from "@/data/transportConfig";
import { pachucaInfoRoutes } from "./pachucaInfoRoutes";

function normalizeRoute(route) {
  return {
    ...route,
    fare: getRouteFare(route),
  };
}

export const allRoutes = [...externalRoutes, ...pachucaInfoRoutes].map(normalizeRoute);
