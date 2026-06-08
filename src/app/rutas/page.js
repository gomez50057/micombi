import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";
import RouteSearch from "@/components/mi-combi/landing/RouteSearch/RouteSearch";
import RouteSourceInventory from "@/components/mi-combi/landing/RouteSourceInventory/RouteSourceInventory";
import QuickAccessNav from "@/components/mi-combi/ui/QuickAccessNav/QuickAccessNav";

export default function RutasPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pageShell">
          <div className="pageIntro">
            <h1>Busca tu combi</h1>
            <p>
              Consulta las rutas cargadas desde fuentes externas y oficiales.
              Tambien puedes revisar cuales registros ya estan integrados y
              cuales faltan por completar.
            </p>
          </div>
          <QuickAccessNav
            items={[
              { href: "#buscar-rutas", label: "Buscar" },
              { href: "#comparar-rutas", label: "Comparar" },
              { href: "/mapa", label: "Mapa" },
              { href: "#inventario-rutas", label: "Inventario" },
            ]}
          />
          <RouteSearch advanced hideResultsUntilQuery resultLimit={24} showFilters />
          <RouteSourceInventory />
        </section>
      </main>
      <Footer />
    </>
  );
}
