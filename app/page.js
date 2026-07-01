import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TabsSection from "./components/TabsSection";
import LogosStrip from "./components/LogosStrip";
import SkillsSection from "./components/SkillsSection";
import NewsSection from "./components/NewsSection";
import ForresterSection from "./components/ForresterSection";
import CommunitySection from "./components/CommunitySection";
import DemoSection from "./components/DemoSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TabsSection />
      <LogosStrip />
      <SkillsSection />
      <NewsSection />
      <ForresterSection />
      <CommunitySection />
      <DemoSection />
      <Footer />
    </>
  );
}
