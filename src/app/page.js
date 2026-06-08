import Navbar from "@/components/mi-combi/layout/Navbar/Navbar";
import Footer from "@/components/mi-combi/layout/Footer/Footer";
import HeroSection from "@/components/mi-combi/landing/HeroSection/HeroSection";
import RouteSearch from "@/components/mi-combi/landing/RouteSearch/RouteSearch";
import RouteCards from "@/components/mi-combi/landing/RouteCards/RouteCards";
import MapPreview from "@/components/mi-combi/landing/MapPreview/MapPreview";
import HowItWorks from "@/components/mi-combi/landing/HowItWorks/HowItWorks";
import PopularPlaces from "@/components/mi-combi/landing/PopularPlaces/PopularPlaces";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <RouteSearch
          hideResultsUntilQuery
          resultLimit={6}
          showMoreHref="/rutas"
        />
        <RouteCards limit={8} showMoreHref="/rutas" />
        <MapPreview />
        <HowItWorks />
        <PopularPlaces />
      </main>
      <Footer />
    </>
  );
}
