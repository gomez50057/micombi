"use client";

import dynamic from "next/dynamic";

const RouteDrawer = dynamic(() => import("./RouteDrawer"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 520 }}>Cargando herramienta...</div>,
});

export default RouteDrawer;
