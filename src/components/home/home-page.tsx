import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { HeroReveal } from "@/components/home/hero-reveal";
import { EventRadarSection } from "@/components/home/event-radar-section";
import { AboutSection } from "@/components/home/about-section";
import { HomeScrollStory } from "@/components/home/home-scroll-story";
import { TeamPreview } from "@/components/home/team-preview";
import { ContactSection } from "@/components/home/contact-section";
import { HomeScrollExperience } from "@/components/home/home-scroll-experience";
import { InitiativesPreview } from "@/components/home/initiatives-preview";

export function HomePage() {
  return (
    <div className="tvc-textured-page min-h-screen text-[#f4f3ef] flex flex-col selection:bg-[#f5ed00] selection:text-black relative">
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <HomeScrollExperience>
          <HeroReveal />
          <EventRadarSection />
          <AboutSection />
          <HomeScrollStory />
          <InitiativesPreview />
          <TeamPreview />
          <ContactSection />
        </HomeScrollExperience>
      </main>
      <SiteFooter />
    </div>
  );
}
