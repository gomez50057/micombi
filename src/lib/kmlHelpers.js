function escapeKML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildRouteKML({
  routeName,
  routeDescription,
  mainMunicipality,
  points,
}) {
  const coordinates = points
    .map((point) => `${point.lng},${point.lat},0`)
    .join(" ");

  const name = escapeKML(routeName || "Ruta sin nombre");
  const description = escapeKML(routeDescription || "");
  const municipality = escapeKML(mainMunicipality || "Sin definir");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <description>${description}</description>
    <Placemark>
      <name>${name}</name>
      <description>
        Municipio principal: ${municipality}
        Fuente: Trazo manual ciudadano
        Estado: Trazo preliminar
      </description>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          ${coordinates}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
}
