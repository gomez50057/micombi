import { sampleRoutes } from "./sampleRoutes";

export const pachucaRoutes = sampleRoutes.filter((route) =>
  route.municipalities.includes("Pachuca de Soto")
);
