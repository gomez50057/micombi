export function downloadJSON(data, filename = "mi-combi-ruta.geojson") {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {
    type: "application/geo+json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function downloadTextFile(
  content,
  filename = "mi-combi-ruta.kml",
  mimeType = "application/vnd.google-earth.kml+xml"
) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
