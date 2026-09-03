import { useEffect } from "react";
import Aurora from "@/components/Aurora";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollProgress from "@/components/ScrollProgress";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Certifications from "@/components/Certifications";
import Projects from "@/components/Projects";
import Publications from "@/components/Publications";
import GitHubStats from "@/components/GitHubStats";
import TLDR from "@/components/TLDR";
import Footer from "@/components/Footer";
import LightModeBanner from "@/components/LightModeBanner";
import TLDRFloat from "@/components/TLDRFloat";
import HUD from "@/components/game/HUD";
import Toasts from "@/components/game/Toasts";
import ZoneBanner from "@/components/game/ZoneBanner";
import LevelUp from "@/components/game/LevelUp";
import QuestPanel from "@/components/game/QuestPanel";
import ZoneObserver from "@/components/game/ZoneObserver";
import Konami from "@/components/game/Konami";
import BossFight from "@/components/game/BossFight";
import Journey from "@/components/game/Journey";
import { useGame } from "@/game/store";
import { setSoundEnabled } from "@/game/sfx";
import { initSmoothScroll, scrollToHash } from "@/lib/scroll";

export default function App() {
  const soundOn = useGame((s) => s.soundOn);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    const stop = initSmoothScroll();
    const hash = window.location.hash;
    if (hash) {
      const t = setTimeout(() => scrollToHash(hash), 650);
      return () => {
        clearTimeout(t);
        stop();
      };
    }
    return stop;
  }, []);

  return (
    <div className="relative min-h-screen">
      <Aurora />
      <CustomCursor />
      <LightModeBanner />
      <ScrollProgress />
      <CommandPalette />
      <Navbar />
      <ScrollToTop />
      <TLDRFloat />
      <main className="pb-16 lg:pb-0">
        <Hero />
        <MarqueeStrip />
        <Journey />
        <Experience />
        <Skills />
        <Education />
        <Certifications />
        <Projects />
        <Publications />
        <GitHubStats />
        <TLDR />
        <BossFight />
        <Footer />
      </main>

      <HUD />
      <Toasts />
      <ZoneBanner />
      <LevelUp />
      <QuestPanel />
      <ZoneObserver />
      <Konami />
    </div>
  );
}
