import "./globals.css";
import GoogleAnalytics from "@/components/mi-combi/";
import ServiceWorkerRegister from "@/components/mi-combi/system/GoogleAnalytics/GoogleAnalytics";
import ToastViewport from "@/components/mi-combi/ui/ToastViewport/ToastViewport";

export const metadata = {
  title: "Mi Combi Pachuca | La que si te deja",
  description:
    "Mapa ciudadano de rutas de combis en Pachuca y su zona metropolitana.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://micombi.gabrielgomez.site"),
  openGraph: {
    title: "Mi Combi Pachuca | La que sí te deja",
    description:
      "Mapa ciudadano para consultar rutas de combis en Pachuca y su zona metropolitana.",
    url: "https://micombi.gabrielgomez.site",
    siteName: "Mi Combi Pachuca",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <ServiceWorkerRegister />
        <ToastViewport />
        {children}
      </body>
    </html>
  );
}
