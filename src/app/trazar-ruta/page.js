import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";
import RouteDrawer from "@/components/mi-combi/maps/RouteDrawer/RouteDrawerClient";

export default function TrazarRutaPage() {
  return (
    <>
      <Navbar />
      <main className="pageShell">
        <div className="pageIntro">
          <h1>Traza tu ruta</h1>
          <p>
            Toca el mapa para marcar por donde pasa la combi, ponle nombre y
            descarga el archivo para mandarlo.
          </p>
        </div>
        <RouteDrawer />
      </main>
      <Footer />
    </>
  );
}
