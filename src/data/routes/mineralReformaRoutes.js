import { sampleRoutes } from "./sampleRoutes";

export const mineralReformaRoutes = sampleRoutes.filter((route) =>
  route.municipalities.includes("Mineral de la Reforma")
);
