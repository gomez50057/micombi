import "./globals.css";
import GoogleAnalytics from "@/components/mi-combi/system/GoogleAnalytics/GoogleAnalytics";
import ServiceWorkerRegister from "@/components/mi-combi/system/ServiceWorkerRegister/ServiceWorkerRegister";
import ToastViewport from "@/components/mi-combi/ui/ToastViewport/ToastViewport";

const siteUrl = "https://micombi.gabrielgomez.site";

export const metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: "Mi Combi Pachuca",
  title: {
    default: "Mi Combi Pachuca | La que sí te deja",
    template: "%s | Mi Combi Pachuca",
  },
  description:
    "Consulta rutas de combis en Pachuca y su zona metropolitana. Mi Combi es un mapa ciudadano para saber cuál ruta te deja más cerca, sin andar preguntando.",

keywords: [
  // Marca
  "Mi Combi",
  "Mi Combi Pachuca",
  "Mi Combi Hidalgo",
  "Mi Combi Zona Metropolitana de Pachuca",

  // Búsquedas principales
  "rutas de combis Pachuca",
  "combis Pachuca",
  "mapa de combis Pachuca",
  "transporte público Pachuca",
  "rutas de transporte Pachuca",
  "rutas de transporte público Pachuca",
  "mapa de transporte público Pachuca",
  "movilidad Pachuca",
  "transporte ciudadano Pachuca",

  // Municipios ZMP
  "combis Pachuca",
  "rutas de combis Pachuca",
  "combis Mineral de la Reforma",
  "rutas de combis Mineral de la Reforma",
  "combis Pachuquilla",
  "rutas de combis Pachuquilla",
  "combis Epazoyucan",
  "rutas de combis Epazoyucan",
  "combis Mineral del Monte",
  "rutas de combis Mineral del Monte",
  "combis Real del Monte",
  "rutas de combis Real del Monte",
  "combis San Agustín Tlaxiaca",
  "rutas de combis San Agustín Tlaxiaca",
  "combis Zapotlán de Juárez",
  "rutas de combis Zapotlán de Juárez",
  "combis Zempoala",
  "rutas de combis Zempoala",

  // Frases naturales de búsqueda
  "qué combi me deja en Pachuca",
  "qué combi pasa por Pachuca",
  "cómo llegar en combi en Pachuca",
  "qué ruta de combi tomar en Pachuca",
  "rutas para llegar en combi",
  "rutas de combis cerca de mí",
  "mapa ciudadano de combis",
],

  authors: [
    {
      name: "Gabriel Gómez Gómez",
      url: "https://gabrielgomez.site",
    },
  ],
  creator: "Gabriel Gómez Gómez",
  publisher: "Gabriel Gómez Gómez",

  category: "transportation",

  manifest: "/manifest.json",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Mi Combi Pachuca | La que sí te deja",
    description:
      "Mapa ciudadano para consultar rutas de combis en Pachuca y su zona metropolitana. Encuentra cuál ruta te deja más cerca.",
    url: siteUrl,
    siteName: "Mi Combi Pachuca",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mi Combi Pachuca - Mapa ciudadano de rutas de combis",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mi Combi Pachuca | La que sí te deja",
    description:
      "Consulta rutas de combis en Pachuca y su zona metropolitana con un mapa ciudadano fácil de usar.",
    images: ["/og-image.jpg"],
    creator: "@gomez50057",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },

  appleWebApp: {
    capable: true,
    title: "Mi Combi Pachuca",
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        <ServiceWorkerRegister />
        <ToastViewport />
        {children}
      </body>
    </html>
  );
}