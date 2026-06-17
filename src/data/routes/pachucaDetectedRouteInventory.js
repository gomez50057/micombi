export const detectedRouteCoverageLabels = {
  detected: "Detectada",
  loaded: "Ya la tenemos",
  partial: "Variante cargada",
  missing: "Hace falta",
};

const SOURCE = "Tabla No. 55 Inventario derroteros y costo de STCH";
const DEFAULT_NOTE =
  "Ruta detectada en fuente STCH. Falta validar trazo, paradas y variantes en Mi Combi.";

const slugify = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseFare = (fareOriginal) => {
  const numbers =
    String(fareOriginal || "")
      .match(/\d+(?:\.\d+)?/g)
      ?.map(Number) || [];

  return {
    fareMin: numbers.length ? Math.min(...numbers) : null,
    fareMax: numbers.length ? Math.max(...numbers) : null,
  };
};

const splitStops = (derrotero) =>
  String(derrotero || "")
    .split(" - ")
    .map((stop) => stop.trim())
    .filter(Boolean);

const rawRoutes = [
  ["Epazoyucan", "01 EPA C", "Santa Mónica - Cabecera Municipal de Epazoyucan - Cabecera Municipal de Pachuca", "HIACE PANEL", 26, "Min. 10.00\nMax. 16.00", 153],
  ["Epazoyucan", "02 EPA C", "San Juan Tizahuapán - Cabecera Municipal de Pachuca", "URVAN PANEL", 9, "Min. 10.00\nMax. 12.00", 153],
  ["Epazoyucan", "03 EPA C", "Xolostitla - El Manzano - Cabecera Municipal de Pachuca", "URVAN VAN", 3, "Min. 10.00\nMax. 12.00", 153],
  ["Epazoyucan", "04 EPA C", "Jalapilla - Mercillero - Ocote Chico - Pachuca", "URVAN PANEL", 4, "Min. 10.00\nMax. 25.00", 153],
  ["Epazoyucan", "05 EPA C", "Villa Margarita - Xochihuacán - Cabecera Municipal de Pachuca", "URVAN PANEL", 14, "Min. 10.00\nMax. 15.00", 153],
  ["Epazoyucan", "06 EPA C", "Ciénega Larga - El Guajolote - Nopalillo - El Manzano - Xolostitla - Pachuquilla - Pachuca", "URVAN PANEL", 4, "Min. 10.00\nMax. 25.00", 153],
  ["Epazoyucan", "07 EPA C", "Hacienda Margarita - Col. Cuesco (Pachuca, Hgo.)", "URVAN PANEL", 12, "Min. 10.00\nMax. 12.00", 153],
  ["Epazoyucan", "08 EPA C", "La Joya - Nopalillo - Pachuca", "URVAN PANEL", 1, "Min. 10.00\nMax. 20.00", 153],
  ["Epazoyucan", "10 EPA C", "San Francisco - Epazoyucan", "URVAN LARGA", 2, "-", 153],
  ["Epazoyucan", "11 EPA C", "Nopalapa - Fracc. Don Pablo - Central de Abasto - Plaza Juárez", "URVAN PANEL", 7, "10", 153],
  ["Epazoyucan", "12 EPA C", "Santa Mónica - San Cristóbal - Buenavista", "URVAN PANEL", 2, "-", 153],

  ["Mineral de la Reforma", "01 MRE C", "Fracc. Pedregal de Los Ángeles 1 y 2 - Fracc. Rinconada de Los Ángeles - La Calera - Central de Abasto - Plaza Juárez", "URVAN VAGONETA", 37, "10", 153],
  ["Mineral de la Reforma", "02 MRE C", "Pueblo de Amaque - Central de Autobuses", "URVAN PANEL", 10, "10", 153],
  ["Mineral de la Reforma", "03 MRE C", "Gasolinera (La Aldea) - Central de Autobuses", "URVAN PANEL", 8, "10", 153],
  ["Mineral de la Reforma", "04 MRE C", "ICATHI (Cerritos) - Central de Autobuses", "URVAN PANEL", 10, "10", 153],
  ["Mineral de la Reforma", "05 MRE C", "Francisco Villa - Central de Autobuses", "URVAN PANEL", 5, "10", 153],
  ["Mineral de la Reforma", "06 MRE C", "Frac. San Fernando - Central de Abasto - Plaza Juárez", "URVAN PANEL", 15, "10", 153],
  ["Mineral de la Reforma", "07 MRE C", "Col. Francisco Villa - La Calera - Central de Abasto - Plaza Juárez", "URVAN VAGONETA", 12, "10", 153],
  ["Mineral de la Reforma", "08 MRE C", "Frac. Minerales 1 - Central de Autobuses", "URVAN PANEL", 6, "10", 153],
  ["Mineral de la Reforma", "10 MRE C", "Chavarría - Av. de Los Volcanes", "URVAN PANEL", 12, "10", 154],
  ["Mineral de la Reforma", "12 MRE C", "Providencia - Chavarría - Explanada", "URVAN PANEL", 11, "10", 154],

  ["Mineral del Monte", "01 MMO C", "Ciénega Larga - Tezoantla - Mineral del Monte", "URVAN PANEL", 4, "Min. 10.00\nMax. 18.00", 154],
  ["Mineral del Monte", "03 MMO C", "Pueblo Nuevo - Pachuca", "URVAN PANEL", 8, "Min. 10.00\nMax. 13.00", 154],
  ["Mineral del Monte", "04 MMO C", "San Pedro Huexotitla - Mineral del Monte", "URVAN PANEL", 2, "Min. 10.00\nMax. 13.00", 154],
  ["Mineral del Monte", "05 MMO C", "Mineral del Monte - Pachuca", "URVAN PANEL", 38, "-", 154],

  ["Pachuca de Soto", "01 PCH C", "Las Palmas - San Antonio - Central de Autobuses - La Paz - Pri Chacón - UAEH - 11 de Julio - Céspedes", "URVAN PANEL", 27, "10", 154],
  ["Pachuca de Soto", "02 PCH C", "Matilde - San Antonio - Central de Autobuses - ZI La Paz - PRI Chacón - 11 de Julio - Céspedes - Campestre del Álamo", "CHASIS CONTROL DELANTERO 455 - 175 - 70 AUTOBÚS", 19, "10", 154],
  ["Pachuca de Soto", "03 PCH C", "Huixmi - Blvd. Minero Doria", "URVAN PANEL", 12, "10", 154],
  ["Pachuca de Soto", "04 PCH C", "Las Torres - Col. Ávila Camacho - Río de La Soledad - La Surtidora - Centro", "URVAN PANEL", 4, "10", 154],
  ["Pachuca de Soto", "05 PCH C", "San Guillermo - Río de La Soledad - La Surtidora - Centro", "URVAN PANEL", 5, "10", 154],
  ["Pachuca de Soto", "06 PCH C", "Dos Carlos - Col. Ávila Camacho - Río de La Soledad - La Surtidora - Centro", "URVAN PANEL", 4, "10", 154],
  ["Pachuca de Soto", "07 PCH C", "Punta Azul - Piracantos - Santa Julia - Plutarco E. Calles - Col. Doctores - Céspedes UAEH - Pachuquilla", "URVAN URVAN", 25, "10", 154],
  ["Pachuca de Soto", "08 PCH C", "Fracc. Saucillo - PRI Chacón - San Cristóbal - ZI La Paz - Periodistas - Centro", "URVAN PANEL", 33, "10", 154],
  ["Pachuca de Soto", "09 PCH C", "Plaza de Toros - Tulipanes - Tuzos - La Reforma - Centro", "URVAN PANEL", 32, "10", 154],
  ["Pachuca de Soto", "10 PCH C", "11 de Julio - Doctores - Surtidora - Centro", "URVAN PANEL", 16, "10", 154],
  ["Pachuca de Soto", "107 PCH C", "La Loma - Palmar - Centro", "URVAN PANEL", 28, "10", 154],
  ["Pachuca de Soto", "108 PCH C", "Belisario Domínguez - Av. Constituyentes - Av. de Los Árboles - Providencia - Colonia Amaque", "URVAN PANEL", 64, "10", 154],
  ["Pachuca de Soto", "11 PCH C", "Col. Centro - Col. Periodistas - Col. Céspedes - Reforma - Col. Unidad Minera - Cabecera Municipal de Pachuquilla", "URVAN PANEL", 6, "10", 154],
  ["Pachuca de Soto", "110 PCH C", "DESCTI - Colosio - Hospitales", "URVAN PANEL", 22, "10", 154],
  ["Pachuca de Soto", "12 PCH C", "La Raza - Cubitos - Doctores - Centro", "URVAN PANEL", 4, "10", 154],
  ["Pachuca de Soto", "14 PCH C", "Barrio La Cruz - Barrio El Arbolito - Centro - Surtidora - Céspedes", "URVAN PANEL", 10, "10", 154],
  ["Pachuca de Soto", "15 PCH C", "Minerva - Guadalupe - Río de La Soledad - Céspedes - Doctores - Centro", "8.15 CAMIÓN", 10, "10", 154],
  ["Pachuca de Soto", "19 PCH C", "Dos Carlos - Calabazas - Jaltepec - Surtidora - Centro", "AUTOBÚS AUTOBÚS", 4, "10", 155],
  ["Pachuca de Soto", "20 PCH C", "Centro - Céspedes - Doctores - UAEH - Campestre Villas de Álamo", "URVAN PANEL", 35, "10", 155],
  ["Pachuca de Soto", "21 PCH C", "Mirador - Centro - Doctores - Surtidora - El Lobo", "URVAN PANEL", 12, "10", 155],
  ["Pachuca de Soto", "23 PCH C", "Piracantos - El Palmar - Sta. Julia - Revolución - Centro", "URVAN PANEL", 20, "10", 155],
  ["Pachuca de Soto", "25 A PCH C", "Central de Autobuses - Centro", "URVAN PANEL", 14, "10", 155],
  ["Pachuca de Soto", "25 B PCH C", "Central de Autobuses - Bosques del Peñar - Centro", "URVAN PANEL", 13, "10", 155],
  ["Pachuca de Soto", "25 C PCH C", "Plutarco Elías Calles - Prepa 3 - Santa Julia - Central de Autobuses - Centro", "URVAN PANEL", 13, "10", 155],
  ["Pachuca de Soto", "25 D PCH C", "Punta Azul - Palmar - Central de Autobuses - Centro", "URVAN PANEL", 10, "10", 155],
  ["Pachuca de Soto", "25 E PCH C", "Centro - Central de Autobuses - Conalep - El Saucillo - Providencia - Fracc. Paseos de Chavarría", "URVAN PANEL", 11, "10", 155],
  ["Pachuca de Soto", "25 F PCH C", "Ruta 25 F", "URVAN PANEL", 5, "-", 155],
  ["Pachuca de Soto", "27 A PCH C", "Azoyatla - Campestre - Villas del Álamo - Surtidora - Centro", "URVAN PANEL", 17, "10", 155],
  ["Pachuca de Soto", "28 PCH C", "Col. Anáhuac - El Lobo - Col. Guadalupe - Col. Doctores - Plaza Juárez - Centro", "URVAN PANEL", 5, "10", 155],
  ["Pachuca de Soto", "29 PCH C", "Central de Autobuses - Cubitos - Doctores - Céspedes - Ávila Camacho", "URVAN PANEL", 40, "10", 155],
  ["Pachuca de Soto", "30 TLA C", "Tula de Allende - Pachuca de Soto (Vía Ajacuba)", "URVAN PANEL", 51, "Min. 10.00\nMax. 72.00", 155],
  ["Pachuca de Soto", "34 A PCH C", "Central - Cubitos - Prepa 4 - Conafe", "URVAN PANEL", 13, "10", 155],
  ["Pachuca de Soto", "35 PCH C", "Santiago Tlapacoya - Plutarco E. Calles - Centro", "HIACE PANEL", 7, "10", 155],
  ["Pachuca de Soto", "36 PCH C", "San Bartolo Norte - Vista Hermosa - López Portillo - Col. Cuauhtémoc - Centro", "URVAN PANEL", 12, "10", 155],
  ["Pachuca de Soto", "37 PCH C", "Centro - Del Castillo - La Palma - El Arbolito - Nueva Estrella - Centro", "URVAN PANEL", 6, "10", 155],
  ["Pachuca de Soto", "38 PCH C", "Fracc. Colosio - Campo de Tiro - Plutarco E. Calles - Morelos - Centro", "URVAN PANEL", 23, "10", 155],
  ["Pachuca de Soto", "39 PCH C", "La Pila - La Cruz - San Bartolo - Centro", "URVAN PANEL", 12, "10", 155],
  ["Pachuca de Soto", "41 PCH C", "El Roble - El Venado - Venta Prieta - Periodistas - Centro", "URVAN PANEL", 17, "10", 155],
  ["Pachuca de Soto", "42 PCH C", "Matilde - San Antonio - Venta Prieta - Centro", "URVAN PANEL", 11, "10", 155],
  ["Pachuca de Soto", "46 PCH C", "Tilcuautla - Punta Azul - Piracantos - Parque de Poblamiento - Plutarco E. Calles - Col. Los Cedros - Fracc. Aquiles Serdán - Col. Rojo Gómez - Col. Morelos - Centro", "URVAN PANEL", 25, "10", 155],
  ["Pachuca de Soto", "47 PCH C", "Fracc. Colosio - Campo de Tiro - Plutarco E. Calles - Doctores - Céspedes - 11 de Julio - Taxistas Carboneras", "URVAN PANEL", 54, "10", 156],
  ["Pachuca de Soto", "48 PCH C", "El Palmar - Av. Revolución - Seguro Social - Hospital General", "EUROVAN PANEL", 33, "10", 156],
  ["Pachuca de Soto", "49 PCH C", "Abetos - El Palmar - Revolución - Centro", "URVAN PANEL", 24, "10", 156],
  ["Pachuca de Soto", "52 PCH C", "Parque Urbano - San Antonio - Soriana - San Javier - Real de Minas - Cd. de Los Niños", "URVAN PANEL", 26, "10", 156],
  ["Pachuca de Soto", "53 A PCH C", "Centro - Carboneras - Campestre - Villas del Álamo", "URVAN PANEL", 25, "10", 156],
  ["Pachuca de Soto", "53 PCH C", "Centro - Doctores - Carboneras - Campestre - Villas del Álamo", "URVAN PANEL", 4, "10", 156],
  ["Pachuca de Soto", "54 PCH C", "Bosques del Peñar - PRI Chacón - Doctores - Surtidora - Centro", "URVAN PANEL", 20, "10", 156],
  ["Pachuca de Soto", "55 PCH C", "Centro - San Nicolás - La Alcantarilla - Patoni - Españita - La Cruz - Centro", "URVAN PANEL", 5, "10", 156],
  ["Pachuca de Soto", "56 PCH C", "Centro - Doctores - Cubitos - Felipe Ángeles - 11 de Julio - Centro", "CHASIS CABINA L - 1217/52 MINIBUS", 4, "10", 156],
  ["Pachuca de Soto", "57 A PCH C", "Soriana Plaza del Valle - El Palmar - Centro - Loreto", "URVAN PANEL", 21, "10", 156],
  ["Pachuca de Soto", "58 PCH C", "Col. Pirules - Col. Unión Antorchista - Col. 20 de Noviembre - Col. San Bartolo - Centro", "URVAN PANEL", 20, "10", 156],
  ["Pachuca de Soto", "59 A PCH C", "Providencia - UAEH - Céspedes - Doctores - Centro", "AUTOBÚS AUTOBÚS", 32, "10", 156],
  ["Pachuca de Soto", "59 PCH C", "Providencia - UAEH - Céspedes - Doctores - Centro", "URVAN PANEL", 34, "10", 156],
  ["Pachuca de Soto", "60 PCH C", "San Antonio - Venta Prieta - Periodistas - Centro", "EUROCAR AUTOBÚS", 9, "10", 156],
  ["Pachuca de Soto", "61 PCH C", "Santiago Tlapacoya - CEDICSO - Mariano Abasolo - Jiménez - Doria", "URVAN PANEL", 12, "10", 156],
  ["Pachuca de Soto", "63 PCH C", "La Loma - El Palmar - Santa Julia - Plutarco E. Calles - Centro", "URVAN PANEL", 21, "10", 156],
  ["Pachuca de Soto", "64 PCH C", "Cabecera Municipal de Pachuca (Central de Autobuses) - Palma Gorda - La Higa", "URVAN PANEL", 4, "Sin trámite", 156],
  ["Pachuca de Soto", "67 PCH C", "Pachuca - Zempoala - Acelotla - San Gabriel Azteca - Tepa El Grande", "URVAN PANEL", 10, "Min. 10.00\nMax. 32.00", 156],
  ["Pachuca de Soto", "68 B PCH C", "Cabecera Municipal de Pachuca - Camelia - San Miguel Cerezo - La Estanzuela - El Cedral", "URVAN PANEL", 28, "Min. 10.00\nMax. 17.00", 156],
  ["Pachuca de Soto", "68 C PCH C", "Cabecera Municipal de Pachuca - Camelia - San Miguel Cerezo - La Estanzuela", "URVAN PANEL", 4, "Min. 10.00\nMax. 17.00", 156],
  ["Pachuca de Soto", "68 D PCH C", "Ruta 68 D", "HIACE PANEL", 28, "Min. 10.00\nMax. 17.00", 156],
  ["Pachuca de Soto", "69 PCH C", "Tulipanes - Centro (Vía Soriana)", "URVAN PANEL", 16, "10", 157],
  ["Pachuca de Soto", "71 PCH C", "Pachuca - Téllez - Tlaquilpan - Col. Guadalupe - Villa de Tezontepec.", "CHASIS 4700 - 175SFC(236\") AUTOBÚS", 21, "Min. 10.00\nMax. 18.00", 157],
  ["Pachuca de Soto", "72 PCH C", "Tlapacoya - Santa Gertrudis - Blvd. Felipe Ángeles - Centro", "URVAN VAN", 9, "10", 157],
  ["Pachuca de Soto", "73 PCH C", "Aurrera Tulipanes - Fracc. La Providencia - Pachuquilla - Amaque", "URVAN VAN", 25, "10", 157],
  ["Pachuca de Soto", "74 PCH C", "Blvd Colosio - Col. Guadalupe", "URVAN PANEL", 63, "10", 157],
  ["Pachuca de Soto", "77 A PCH C", "Providencia - El Saucillo - Fracc. Tuzos - Fracc. Tulipanes - Plaza de Toros - 24 Horas - CEDICSO - ICSA - Hda. La Concepción - Tilcuautla", "PANEL MICROBUS", 42, "10", 157],
  ["Pachuca de Soto", "77 C PCH C", "Tilcuautla - Estanzuela - Cedral - Carretera a Mineral del Chico", "URVAN PANEL", 18, "10", 157],
  ["Pachuca de Soto", "78 A PCH C", "Col. Jorge Obispo - Unión Antorchista - Manuel Otero - Parque de Poblamiento - Santa Julia - Central de Abasto", "URVAN PANEL", 8, "10", 157],
  ["Pachuca de Soto", "79 PCH C", "Fracc. Quinta Bonita - Tulipanes - Frac. Tuzos - Col. Adolfo López Mateos - Cubitos - Parque Hidalgo - Centro", "URVAN PANEL", 12, "10", 157],
  ["Pachuca de Soto", "80 PCH C", "Frac. San Cristóbal - La Providencia - Parque Ind. Canacintra - Col. Adolfo López Mateos - Cubitos - Parque Hidalgo - Centro", "URVAN PANEL", 13, "10", 157],
  ["Pachuca de Soto", "83 PCH C", "Fracc. Los Gemelos - Fracc. Rinconada de Los Ángeles - Fracc. La Calera - La Calera - Central de Autobuses - Plaza Milenio - Centro", "URVAN PANEL", 20, "10", 157],
  ["Pachuca de Soto", "84 A PCH C", "Chavarría - Providencia - Hospital General - Centro", "NAVISTAR AUTOBÚS", 18, "10", 157],
  ["Pachuca de Soto", "84 PCH C", "Fracc. Paseos de Chavarría - Providencia - UAEH - Centro", "URVAN PANEL", 20, "10", 157],
  ["Pachuca de Soto", "86 PCH C", "Fracc. Rinconada de Los Ángeles - Providencia Hospital - General - Centro", "URVAN PANEL", 12, "10", 157],
  ["Pachuca de Soto", "87 PCH C", "El Saucillo - Colinas de La Plata - Centro", "URVAN PANEL", 10, "10", 157],
  ["Pachuca de Soto", "90 A PCH C", "Cabecera Municipal de Pachuca - Cabecera Municipal de Mineral del Monte - Cabecera Municipal de Atotonilco el Grande y (Servicio vía Mineral del Monte)", "HIACE PANEL", 23, "Min. 10.00\nMax. 21.00", 157],
  ["Pachuca de Soto", "90 PCH C", "Cabecera Municipal de Pachuca - Cabecera Municipal de Mineral del Monte - Cabecera Municipal de Atotonilco El Grande (Servicio Vía Mineral del Monte)", "HIACE PANEL", 15, "Min. 10.00\nMax. 21.00", 157],
  ["Pachuca de Soto", "92 A PCH C", "Fracc. Paseos de Chavarría - Central de Autobuses - Plaza Milenio - Centro", "EUROVAN ICHI VAN", 20, "10", 157],
  ["Pachuca de Soto", "93 PCH C", "Col. Ramos Arizpe - Col. Piracantos", "URVAN PANEL", 4, "10", 157],
  ["Pachuca de Soto", "94 PCH C", "La Loma - Los Órganos - Plaza de Toros", "URVAN PANEL", 3, "10", 157],
  ["Pachuca de Soto", "95 A PCH C", "La Loma - Fracc. Colosio - Piracantos - Plutarco E. Calles - Centro", "HIACE PANEL", 16, "10", 158],
  ["Pachuca de Soto", "95 PCH C", "La Loma - Frac. Colosio - Piracantos - Plutarco E. Calles - Centro", "URVAN PANEL", 16, "10", 158],
  ["Pachuca de Soto", "97 A PCH C", "Cd. del Conocimiento - Blvd. del Minero - Calle Doria - Centro", "URVAN PANEL", 6, "10", 158],
  ["Pachuca de Soto", "97 B PCH C", "Cd. del Conocimiento - Blvd. Colosio - Av. del Palmar - Blvd. del Minero - Plaza Juárez - 1° de Mayo - Centro", "URVAN PANEL", 10, "10", 158],
  ["Pachuca de Soto", "97 C PCH C", "Cd. del Conocimiento - Blvd. Colosio - Blvd. Nuevo Hidalgo - Central de Abasto", "URVAN PANEL", 10, "10", 158],
  ["Pachuca de Soto", "98 PCH C", "Pachuca - UPP", "URVAN PANEL", 3, "Sin trámite", 158],
  ["Pachuca de Soto", "99 PCH C", "Pachuca - Ixtula - Zembo", "URVAN PANEL", 4, "Min. 10.00\nMax. 39.00", 158],

  ["San Agustín Tlaxiaca", "01 SAT C", "Tilcuautla - Cabecera Municipal de Pachuca", "URVAN PANEL", 35, "Min. 10.00\nMax. 11.50", 158],
  ["San Agustín Tlaxiaca", "02 SAT C", "Puerto México - Guadalupe Victoria - Cabecera Municipal de San Agustín Tlaxiaca - Cabecera Municipal de Pachuca", "URVAN PANEL", 3, "Min. 13.00\nMax. 28.00", 158],
  ["San Agustín Tlaxiaca", "03 SAT C", "Tulancalco - Puerto México - Cabecera Municipal de San Agustín Tlaxiaca - Cabecera Municipal de Pachuca", "URVAN PANEL", 1, "Min. 13.00\nMax. 28.00", 158],
  ["San Agustín Tlaxiaca", "04 SAT C", "Cabecera Municipal de San Agustín Tlaxiaca - Cabecera Municipal de Pachuca (Ruta Troncal)", "HIACE PANEL", 23, "Min. 10.00\nMax. 17.00", 158],
  ["San Agustín Tlaxiaca", "05 SAT C", "Tepozán - Pino Suárez - Casa Grande - Cabecera Municipal de San Agustín Tlaxiaca - Cabecera Municipal de Pachuca", "URVAN PANEL", 8, "Min. 10.00\nMax. 26.00", 158],
  ["San Agustín Tlaxiaca", "06 SAT C", "San Isidro - Llano Largo - Benito Juárez - Cabecera Municipal de San Agustín Tlaxiaca - Cabecera Municipal de Pachuca", "CRAFTER CARGO VAN VAN", 2, "Min. 10.00\nMax. 27.00", 158],
  ["San Agustín Tlaxiaca", "07 SAT C", "San Francisco Tecajique - El Cerrito - El Chamizal - Sanjuan Solís - Cabecera Municipal de Pachuca y", "HIACE PANEL", 7, "Min. 18.00\nMax. 19.00", 158],
  ["San Agustín Tlaxiaca", "08 SAT C", "Ixcuinquitlapilco - Cabecera Municipal San Agustín Tlaxiaca - Cabecera Municipal de Pachuca", "URVAN PANEL", 6, "Min. 11.00\nMax. 22.00", 158],
  ["San Agustín Tlaxiaca", "09 SAT C", "Centro - Mexiquito - La Gloria", "URVAN PANEL", 4, "-", 158],
  ["San Agustín Tlaxiaca", "11 SAT C", "El Tepozán - Mexiquito - San Agustín Tlaxiaca - Cabecera Municipal de Pachuca", "SPRINTER VAN", 2, "-", 158],
  ["San Agustín Tlaxiaca", "13 SAT C", "Tornacuxtla - Cabecera Municipal de Pachuca", "HIACE PANEL", 11, "Min. 14.00\nMax. 15.00", 158],
  ["San Agustín Tlaxiaca", "14 SAT C", "Puerto La Palma - Benito Juárez - Cabecera Municipal de Pachuca", "URVAN PANEL", 8, "Min. 10.00\nMax. 12.00", 159],
  ["San Agustín Tlaxiaca", "16 SAT C", "Cabecera Municipal de San Agustín Tlaxiaca - Barrio El Fresno - Ixcuinquitlapilco - Benito Juárez - Llano Largo", "URVAN PANEL", 1, "-", 159],
  ["San Agustín Tlaxiaca", "17 SAT C", "Bindhó - San Agustín Tlaxiaca - DESCTI - Villas de Pachuca - Explanada", "HIACE PANEL", 8, "Min. 10.00\nMax. 17.00", 159],

  ["Tizayuca", "01 TIZ C", "Amp. Nvo. Tizayuca - Tizayuca - Los Ángeles", "URVAN PANEL", 8, "10", 159],
  ["Tizayuca", "02 TIZ C", "Huitzila - Tizayuca - El Carmen", "URVAN PANEL", 12, "10", 159],
  ["Tizayuca", "03 TIZ C", "Tepojaco - Tizayuca - Zona Industrial", "HIACE PANEL", 11, "10", 159],
  ["Tizayuca", "04 TIZ C", "Mogotes - Tizayuca - Zona Industrial", "URVAN PANEL", 6, "10", 159],
  ["Tizayuca", "06 TIZ C", "El Cid - Tizayuca - Nvo. Tizayuca", "URVAN PANEL", 6, "10", 159],
  ["Tizayuca", "06 TIZ C", "El Cid - Tizayuca - Nvo. Tizayuca", "URVAN PANEL", 6, "10", 159],
  ["Tizayuca", "07 TIZ C", "Amp. Lázaro Cárdenas - Tizayuca - Emiliano Zapata", "URVAN PANEL", 6, "10", 159],
  ["Tizayuca", "08 TIZ C", "(Unidad Hab.) Ampliación Nuevo Tizayuca - Geovillas - Barrio El Pedregal", "URVAN PANEL", 8, "10", 159],
  ["Tizayuca", "09 TIZ C", "Amp. Lázaro Cárdenas - Tizayuca - Emiliano Zapata", "URVAN PANEL", 2, "10", 159],
  ["Tizayuca", "10 TIZ C", "Zona Industrial - Tizayuca - Barrio Huicalco", "URVAN PANEL", 5, "10", 159],
  ["Tizayuca", "12 TIZ C", "Huitzila - Universidad", "URVAN PANEL", 4, "10", 159],
  ["Tizayuca", "13 TIZ C", "Lienzo Charro - Tizayuca - Amp. Col. Lázaro Cárdenas - Lim. del Estado de Hidalgo", "URVAN PANEL", 8, "10", 159],
  ["Tizayuca", "14 TIZ C", "Boing Tepojaco U.H. - Rojo Gómez - Tizayuca - Lim. del Estado de Hidalgo", "URVAN PANEL", 6, "10", 159],
  ["Tizayuca", "16 TIZ C", "Col. Bicentenario - Tizayuca - Lim. del Estado de Hidalgo", "URVAN PANEL", 2, "10", 159],
  ["Tizayuca", "17 TIZ C", "Cd. de Los Niños - Tizayuca - Col. La Joya", "URVAN PANEL", 13, "10", 159],
  ["Tizayuca", "18 TIZ C", "Haciendas de Tizayuca 1 - Tizayuca - Zona Industrial", "URVAN PANEL", 8, "10", 159],
  ["Tizayuca", "18 TIZ S", "Geovillas", "URVAN PANEL", 3, "Sin dato (Transporte individual)", 159],
  ["Tizayuca", "19 TIZ C", "Haciendas de Tizayuca 3 - Tizayuca - Zona Industrial", "URVAN PANEL", 15, "10", 159],
  ["Tizayuca", "20 TIZ C", "Rancho Don Antonio 2, 4 y 5 - El Carmen - Tizayuca - Zona Industrial", "URVAN PANEL", 33, "10", 159],
  ["Tizayuca", "21 TIZ C", "Rancho Don Antonio 1 - El Carmen - Tizayuca - Zona Industrial", "HIACE PANEL", 14, "10", 159],
  ["Tizayuca", "22 TIZ C", "Col. Expresidentes - Tizayuca - Zona Industrial", "URVAN PANEL", 5, "10", 160],
  ["Tizayuca", "23 TIZ C", "Fracc. Las Torres - Prepa - Tizayuca - Zona Industrial", "URVAN PANEL", 4, "10", 160],
  ["Tizayuca", "24 TIZ C", "Frac. Villa de los Milagros - Jardín - Tizayuca - Zona Industrial", "URVAN PANEL", 8, "10", 160],
  ["Tizayuca", "25 TIZ C", "Unidad Hab. Col. Los Olmos - El Carmen - Tizayuca - Zona Industrial", "URVAN PANEL", 6, "10", 160],
  ["Tizayuca", "26 TIZ C", "Hacienda de Tizayuca 1 - Rancho Don Antonio 2, 4 y 5", "URVAN PANEL", 7, "10", 160],
  ["Tizayuca", "27 TIZ C", "San Antonio - Tizayuca - Diamante", "URVAN PANEL", 3, "10", 160],
  ["Tizayuca", "28 TIZ C", "Huicalco - Tizayuca - Diamante", "URVAN PANEL", 5, "10", 160],
  ["Tizayuca", "29 TIZ C", "Haciendas Tizayuca 4 - Fracc. Villa Magna", "URVAN PANEL", 22, "10", 160],
  ["Tizayuca", "30 TIZ C", "Haciendas de Tizayuca 2 - Tizayuca - Zona Industrial", "HIACE PANEL", 5, "10", 160],
  ["Tizayuca", "31 TIZ C", "Cuxtitla - Tizayuca - Col. El Arenal", "URVAN PANEL", 10, "10", 160],
  ["Tizayuca", "32 TIZ C", "Presidentes Ejidales - Panteón Huicalco - Tizayuca - Privada Diamante - Panteón Nacozari", "URVAN PANEL", 3, "10", 160],
  ["Tizayuca", "34 TIZ C", "Rancho Don Antonio 3 - Tizayuca - Zona Industrial", "URVAN PANEL", 2, "10", 160],
  ["Tizayuca", "35 TIZ C", "Col. Los Olmos - Unidad Rojo Gómez - Tizayuca - Zona Industrial", "URVAN PANEL", 6, "10", 160],
  ["Tizayuca", "38 TIZ C", "Fracc. Fuentes de Tizayuca 1 - Tizayuca Clínica 33 - Villa Magna", "HIACE URVAN", 6, "10", 160],
  ["Tizayuca", "39 TIZ C", "Fracc. Don Carlos - Tizayuca Técnica 50", "URVAN PANEL", 6, "10", 160],
  ["Tizayuca", "40 TIZ C", "Fracc. El Manantial - La Posta - Tepojaco - U.H. Rojo Gómez - Tizayuca - Zona Industrial", "HIACE PANEL", 13, "10", 160],
  ["Tizayuca", "41 TIZ C", "Fracc. Héroes de Tizayuca 1 - Tizayuca - Limite Estado de Hidalgo", "URVAN PANEL", 13, "10", 160],
  ["Tizayuca", "43 TIZ C", "Fracc. Bosques de Ibiza - Tizayuca - Tulipanes", "URVAN PANEL", 2, "10", 160],
  ["Tizayuca", "44 TIZ C", "Fracc. Fuentes de Tizayuca 2 - Tizayuca - Clínica 33 - Villa Magna", "URVAN PANEL", 6, "10", 160],
  ["Tizayuca", "46 TIZ C", "Haciendas Tizayuca - Hogares Unión - Plaza Tizara - Av. Juárez", "URVAN PANEL", 14, "10", 160],
  ["Tizayuca", "47 TIZ C", "Hogares Unión - Paseos del Pedregal - Sadasi", "URVAN PANEL", 14, "10", 160],
  ["Tizayuca", "48 TIZ C", "Sadasi - Zona Industrial", "URVAN PANEL", 3, "10", 160],

  ["Villa de Tezontepec", "01 VTZ C", "Centro de Villa de Tezontepec - Col. Morelos - Col Juárez - Chamberluco", "NV350 URVAN PANEL", 6, "Min. 9.00\nMax. 17.00", 160],
  ["Villa de Tezontepec", "03 VTZ C", "Entronque Centro de Villa de Tezontepec - Col. Benito Juárez - Chamberluco - Col. Morelos - Esc. Técnica Agropecuaria No. 504", "HIACE MICROBUS", 7, "Min. 8.00\nMax. 11.00", 160],
  ["Villa de Tezontepec", "04 VTZ C", "Entronque de San Javier - Villa de Tezontepec - El Capulín", "URVAN PANEL", 10, "Min. 10.00\nMax. 13.00", 160],

  ["Zapotlán de Juárez", "01 ZAP C", "Entronque Carr. a Acayuca con Carr. Fed. No. 85 - Acayuca - S.P. Huaquilpan - Zapotlán - Entronque Carr. a Zapotlán con Carr. Fed. No. 85", "URVAN PANEL", 2, "10", 161],
  ["Zapotlán de Juárez", "02 ZAP C", "San Pedro Huaquilpan - Zapotlán - Pachuca", "URVAN PANEL", 7, "Min. 8.00\nMax. 18.00", 161],
  ["Zapotlán de Juárez", "03 A ZAP C", "Acayuca - Entronque Carr. a Acayuca con Carr. Fed. No. 85. Troncal", "URVAN PANEL", 3, "10", 161],
  ["Zapotlán de Juárez", "03 ZAP C", "Acayuca - Entronque Carr. a Acayuca con Carr. Fed. No. 85. Troncal", "URVAN PANEL", 3, "10", 161],
  ["Zapotlán de Juárez", "04 ZAP C", "Col. Obrera - Acayuca - Cabecera Municipal de Pachuca", "CHASIS 4700 - 175SFC(236\") AUTOBÚS", 9, "Min. 10.00\nMax. 16.00", 161],
  ["Zapotlán de Juárez", "08 ZAP C", "Zapotlán - San Pedro Huaquilpan", "URVAN PANEL", 2, "10", 161],

  ["Zempoala", "01 ZEM C", "Cabecera Municipal de Zempoala - Cabecera Municipal de Pachuca", "HIACE PANEL", 13, "Min. 10.00\nMax. 20.00", 161],
  ["Zempoala", "02 ZEM C", "San Agustín Zapotlán - Cabecera Municipal de Zempoala", "URVAN PANEL", 4, "Min. 10.00\nMax. 20.00", 161],
  ["Zempoala", "03 ZEM C", "Tepa El Grande - San Gabriel Azteca - Acelotla - Zempoala", "URVAN PANEL", 1, "Min. 10.00\nMax. 31.00", 161],
  ["Zempoala", "04 ZEM C", "La Trinidad - Santa Cruz - Cabecera Municipal de Pachuca y", "URVAN PANEL", 2, "Min. 10.00\nMax. 16.00", 161],
  ["Zempoala", "05 TZT C", "Cabecera Municipal de Tezontepec de Aldama - El Chamizal y Vic.", "URVAN PANEL", 2, "Min. 10.00\nMax. 12.00", 161],
  ["Zempoala", "05 ZEM C", "San Antonio Oxtoyuca - Cabecera Municipal de Zempoala y", "URVAN VAGONETA", 3, "10", 161],
  ["Zempoala", "06 ZEM C", "Zacuala - Cabecera Municipal de Zempoala y", "URVAN PASAJEROS", 3, "10", 161],
  ["Zempoala", "07 ZEM C", "Col. Las Palomas - Acelotla - Venustiano Carranza - Cabecera Municipal de Zempoala", "URVAN PANEL", 2, "-", 161],
  ["Zempoala", "09 ZEM C", "Null", "URVAN PANEL", 1, "-", 161],
  ["Zempoala", "10 PCH C", "11 de Julio - Doctores - Surtidora - Centro", "URVAN PANEL", 16, "10", 161],
  ["Zempoala", "13 ZEM C", "Tepa El Chico - Estación Tepa - Palmitas - Cabecera Municipal de Zempoala", "URVAN PANEL", 3, "10", 161],
  ["Zempoala", "14 ZEM C", "San Mateo Tlajomulco - Santo Tomas - Santa María Tecajete - Cab. Mpal. de Zempoala", "URVAN PANEL", 2, "Min. 11.00\nMax. 18.00", 161],
  ["Zempoala", "15 ZEM C", "El Cerrito - Cabecera Municipal de Zempoala", "RAM WAGON VAN", 1, "10", 162],
  ["Zempoala", "17 ZEM C", "Santa Cruz - Pachuca", "URVAN PANEL", 3, "Min. 10.00\nMax. 16.00", 162],
  ["Zempoala", "18 ZEM C", "Universidad Politécnica de Pachuca Col. Cuesco", "URVAN PANEL", 26, "Min. 10.00\nMax. 13.00", 162],
  ["Zempoala", "19 ZEM C", "San Antonio Oxtoyuca Pachuca", "URVAN PANEL", 3, "Min. 10.00\nMax. 20.00", 162],
];

export const pachucaDetectedRouteInventory = rawRoutes.map(
  (
    [
      municipality,
      routeCode,
      derrotero,
      vehicleType,
      units,
      fareOriginal,
      sourcePage,
    ],
    index
  ) => {
    const { fareMin, fareMax } = parseFare(fareOriginal);

    return {
      id: `${slugify(municipality)}-${slugify(routeCode)}-${index + 1}`,
      municipality,
      routeCode,
      name: `${routeCode} · ${derrotero}`,
      derrotero,
      stops: splitStops(derrotero),
      vehicleType,
      units,
      fareOriginal,
      fareMin,
      fareMax,
      source: SOURCE,
      sourcePage,
      coverage: "detected",
      note: DEFAULT_NOTE,
    };
  }
);

export const detectedRouteInventorySummary =
  pachucaDetectedRouteInventory.reduce(
    (totals, route) => ({
      ...totals,
      totalRoutes: totals.totalRoutes + 1,
      totalUnits: totals.totalUnits + (Number(route.units) || 0),
      byMunicipality: {
        ...totals.byMunicipality,
        [route.municipality]:
          (totals.byMunicipality[route.municipality] || 0) + 1,
      },
    }),
    { totalRoutes: 0, totalUnits: 0, byMunicipality: {} }
  );