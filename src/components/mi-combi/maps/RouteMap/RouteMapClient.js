"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 520 }}>Cargando mapa...</div>,
});

export default RouteMap;
