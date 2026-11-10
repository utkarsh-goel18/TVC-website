import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { HeroReveal } from "@/components/home/hero-reveal";
import { EventRadarSection } from "@/components/home/event-radar-section";
import { AboutSection } from "@/components/home/about-section";
import { TeamPreview } from "@/components/home/team-preview";
import { ContactSection } from "@/components/home/contact-section";
import { HomeScrollExperience } from "@/components/home/home-scroll-experience";
import { InitiativesPreview } from "@/components/home/initiatives-preview";
import { HomeArchive } from "@/components/home/home-archive";
import { HomeIntro } from "@/components/home/home-intro";
import { HomeScrollStory } from "@/components/home/home-scroll-story";
import { AmbientGlowCursor } from "@/components/home/ambient-glow-cursor";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f4f3ef] flex flex-col selection:bg-[#f5ed00] selection:text-black relative">
      <AmbientGlowCursor />
      <HomeIntro />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <HomeScrollExperience>
          <HeroReveal />
          <EventRadarSection />
          <AboutSection />
          <HomeScrollStory />
          <InitiativesPreview />
          <HomeArchive />
          <TeamPreview />
          <ContactSection />
        </HomeScrollExperience>
      </main>
      <SiteFooter />
    </div>
  );
}
