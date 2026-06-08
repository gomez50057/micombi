import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";
import CommunitySection from "@/components/mi-combi/landing/CommunitySection/CommunitySection";
import CollaborationSection from "@/components/mi-combi/landing/CollaborationSection/CollaborationSection";
import TrackRouteSection from "@/components/mi-combi/landing/TrackRouteSection/TrackRouteSection";
import ContributionForm from "@/components/mi-combi/forms/ContributionForm/ContributionForm";

export default function ContribuyePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pageShell">
          <div className="pageIntro">
            <h1>Si sabes la ruta, pasala</h1>
            <p>
              Tu viaje puede ayudar a que alguien mas no se pierda. Manda una
              ruta escrita, un archivo o una correccion.
            </p>
          </div>
          <ContributionForm />
        </section>
        <CommunitySection />
        <CollaborationSection />
        <TrackRouteSection />
      </main>
      <Footer />
    </>
  );
}
