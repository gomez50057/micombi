import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";
import GeoTrackerTutorial from "@/components/mi-combi/tutorials/GeoTrackerTutorial/GeoTrackerTutorial";
import ManualDrawTutorial from "@/components/mi-combi/tutorials/ManualDrawTutorial/ManualDrawTutorial";
import SendRouteTutorial from "@/components/mi-combi/tutorials/SendRouteTutorial/SendRouteTutorial";

export default function TutorialesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pageShell">
          <div className="pageIntro">
            <h1>Tutoriales para pasar el dato</h1>
            <p>
              Graba, traza o manda una ruta sin hacerlo complicado. Lo que
              sepas puede servirle a mucha banda.
            </p>
          </div>
          <GeoTrackerTutorial />
          <ManualDrawTutorial />
          <SendRouteTutorial />
        </section>
      </main>
      <Footer />
    </>
  );
}
