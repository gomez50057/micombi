import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";
import TransportPhotoSection from "@/components/mi-combi/landing/TransportPhotoSection/TransportPhotoSection";
import RouteMap from "@/components/mi-combi/maps/RouteMap/RouteMapClient";

export default function MapaPage() {
  return (
    <>
      <Navbar />
      <main className="pageShell">
        <div className="pageIntro">
          <h1>Mapa de rutas</h1>
          <p>
            Checa rutas cargadas por la comunidad. Algunas todavia estan en
            revision o como trazo preliminar.
          </p>
        </div>
        <RouteMap />
      </main>
      <TransportPhotoSection />
      <Footer />
    </>
  );
}
