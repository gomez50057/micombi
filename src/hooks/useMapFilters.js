"use client";

import { useMemo, useState } from "react";
import {
  filterRoutesByMunicipality,
  filterRoutesByStatus,
} from "@/lib/routeFilters";

export function useMapFilters(routes) {
  const [municipality, setMunicipality] = useState("Todas");
  const [status, setStatus] = useState("Todos");

  const filteredRoutes = useMemo(() => {
    const byMunicipality = filterRoutesByMunicipality(routes, municipality);

    return filterRoutesByStatus(byMunicipality, status);
  }, [municipality, routes, status]);

  return {
    municipality,
    setMunicipality,
    status,
    setStatus,
    filteredRoutes,
  };
}
