import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { HeroReveal } from "@/components/home/hero-reveal";
import { AboutSection } from "@/components/home/about-section";
import { TeamPreview } from "@/components/home/team-preview";
import { ContactSection } from "@/components/home/contact-section";
import { HomeScrollExperience } from "@/components/home/home-scroll-experience";
import { InitiativesPreview } from "@/components/home/initiatives-preview";
import { HomeArchive } from "@/components/home/home-archive";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f4f3ef] flex flex-col selection:bg-[#f5ed00] selection:text-black">
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <HomeScrollExperience>
          <HeroReveal />
          <AboutSection />
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
