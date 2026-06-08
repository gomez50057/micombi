"use client";

import { useState } from "react";

export function useRouteDrawer() {
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [mainMunicipality, setMainMunicipality] = useState("");
  const [points, setPoints] = useState([]);

  const addPoint = ({ lat, lng }) => {
    setPoints((currentPoints) => [
      ...currentPoints,
      {
        id: crypto.randomUUID(),
        lat,
        lng,
        order: currentPoints.length + 1,
      },
    ]);
  };

  const removeLastPoint = () => {
    setPoints((currentPoints) => currentPoints.slice(0, -1));
  };

  const clearPoints = () => {
    setPoints([]);
  };

  return {
    routeName,
    setRouteName,
    routeDescription,
    setRouteDescription,
    mainMunicipality,
    setMainMunicipality,
    points,
    addPoint,
    removeLastPoint,
    clearPoints,
  };
}
