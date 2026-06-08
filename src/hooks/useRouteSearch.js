"use client";

import { useMemo, useState } from "react";
import {
  filterRoutesByMunicipality,
  filterRoutesByStatus,
} from "@/lib/routeFilters";
import { searchRoutes } from "@/lib/routeSearch";

export function useRouteSearch(routes) {
  const [query, setQuery] = useState("");
  const [municipality, setMunicipality] = useState("Todas");
  const [status, setStatus] = useState("Todos");

  const filteredRoutes = useMemo(() => {
    const bySearch = searchRoutes(routes, query);
    const byMunicipality = filterRoutesByMunicipality(bySearch, municipality);

    return filterRoutesByStatus(byMunicipality, status);
  }, [municipality, query, routes, status]);

  return {
    query,
    setQuery,
    municipality,
    setMunicipality,
    status,
    setStatus,
    filteredRoutes,
  };
}
