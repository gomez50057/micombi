import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(
  projectRoot,
  "public",
  "data",
  "geojson",
  "tuzobus-troncal"
);
const outputDirectory = path.join(projectRoot, "src", "data", "generated");
const stationsFileName = "qgis-tuzobus-troncal-estaciones.geojson";

function readGeoJson(fileName) {
  const filePath = path.join(sourceDirectory, fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

const routeFileNames = readdirSync(sourceDirectory)
  .filter((fileName) => /^qgis-tuzobus-troncal\d+-(ida|vuelta)\.geojson$/i.test(fileName))
  .sort();

if (routeFileNames.length === 0) {
  throw new Error(`No se encontraron trazos GeoJSON en ${sourceDirectory}`);
}

const routes = Object.fromEntries(
  routeFileNames.map((fileName) => {
    const match = fileName.match(
      /^qgis-tuzobus-troncal(\d+)-(ida|vuelta)\.geojson$/i
    );
    return [`troncal${match[1]}-${match[2].toLowerCase()}`, readGeoJson(fileName)];
  })
);

const generatedSource = `// Este archivo se genera desde public/data/geojson/tuzobus-troncal.
// No editar manualmente: npm run dev y npm run build lo regeneran.
export const tuzobusTroncalGeojson = ${JSON.stringify(
  {
    stations: readGeoJson(stationsFileName),
    routes,
  },
  null,
  2
)};
`;

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  path.join(outputDirectory, "tuzobusTroncalGeojson.js"),
  generatedSource,
  "utf8"
);

console.log(
  `GeoJSON Tuzobus Troncal regenerado: ${routeFileNames.length} trazos y ${tuzobusTroncalGeojsonStationCount()} estaciones.`
);

function tuzobusTroncalGeojsonStationCount() {
  return readGeoJson(stationsFileName).features?.length || 0;
}
