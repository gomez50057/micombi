import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";

export default function OfflinePage() {
  return (
    <>
      <Navbar />
      <main className="pageShell">
        <div className="pageIntro">
          <h1>Estas sin conexion</h1>
          <p>
            Puedes seguir viendo rutas que ya hayan quedado cargadas en tu
            navegador. Cuando vuelva el internet, Mi Combi se actualiza otra
            vez.
          </p>
          <p>
            Tus rutas favoritas, busquedas recientes y reportes preparados se
            quedan guardados solo en este dispositivo.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
