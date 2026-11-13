import Link from "next/link";
import Image from "next/image";
import { AboutPhotoCarousel } from "@/components/home/about-photo-carousel";
import {
  ArrowUpRight,
  Compass,
  Rocket,
  ShieldCheck,
  Share2,
  Camera,
  Layers,
  Award,
  Users,
  Briefcase,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface PhotoFrameProps {
  label: string;
  location: string;
  caption: string;
  imageSrc?: string;
  aspectRatio?: string;
  className?: string;
}

function EditorialPhotoFrame({
  label,
  location,
  caption,
  imageSrc,
  aspectRatio = "aspect-[16/10]",
  className = "",
}: PhotoFrameProps) {
  return (
    <div
      data-tvc-glass-card
      className={`group relative overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.18)] hover:border-[#f5ed00]/40 flex flex-col justify-between p-3.5 sm:p-6 transition-all duration-300 ${aspectRatio} ${className}`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45"
      />

      {/* Corner crosshairs with hover glow */}
      <div className="tvc-crosshair absolute top-2.5 left-2.5 text-[11px] font-mono text-white/30 select-none z-10">+</div>
      <div className="tvc-crosshair absolute top-2.5 right-2.5 text-[11px] font-mono text-white/30 select-none z-10">+</div>
      <div className="tvc-crosshair absolute bottom-2.5 left-2.5 text-[11px] font-mono text-white/30 select-none z-10">+</div>
      <div className="tvc-crosshair absolute bottom-2.5 right-2.5 text-[11px] font-mono text-white/30 select-none z-10">+</div>

      {!imageSrc ? (
        <div className="relative z-10 my-auto text-center py-2 sm:py-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-[#f5ed00] shadow-[0_0_16px_rgba(245,237,0,0.2)]">
            <Camera className="w-3.5 h-3.5 sm:w-5 sm:h-5 opacity-90" />
          </div>
          <p className="font-mono text-[10px] sm:text-xs text-[#a5a49f] max-w-xs mx-auto leading-relaxed">
            {caption}
          </p>
        </div>
      ) : null}

    </div>
  );
}

export function AboutSection() {
  const pillars = [
    {
      num: "01",
      name: "IDEATE",
      title: "Turning sparks into startups",
      description:
        "Turning initial sparks into scalable startups, innovative solutions and game-changing opportunities.",
      icon: Compass,
      hasBeam: true,
    },
    {
      num: "02",
      name: "ASCEND",
      title: "Empowering founder trajectories",
      description:
        "Empowering students through industry mentorship, valuable resources and founder networks to turn ideas into reality.",
      icon: Rocket,
      hasBeam: false,
    },
    {
      num: "03",
      name: "LEAD",
      title: "Creating the future",
      description:
        "Building a community of dreamers, doers and risk-takers who don't just prepare for the future — they create it.",
      icon: ShieldCheck,
      hasBeam: false,
    },
    {
      num: "04",
      name: "BUILD THE NETWORK",
      title: "Catalysing connections",
      description:
        "Connecting ambitious peers, TIET alumni, founders and industry leaders to create opportunities for collaboration and growth.",
      icon: Share2,
      hasBeam: true,
    },
  ];

  const skillDomains = [
    {
      title: "Business Development",
      description: "Market expansion, strategic partnerships, and customer acquisition models.",
      icon: TrendingUp,
    },
    {
      title: "Product Management",
      description: "Roadmapping, customer discovery, feature prioritization, and product loops.",
      icon: Layers,
    },
    {
      title: "Finance",
      description: "Unit economics, cap table basics, financial modeling, and venture budgeting.",
      icon: FileSpreadsheet,
    },
    {
      title: "Consultancy",
      description: "Structured problem solving, market sizing, case frameworks, and diagnostics.",
      icon: Briefcase,
    },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative bg-[#060605] text-[#f4f3ef] border-t border-white/[0.08] py-12 sm:py-20 lg:py-36 overflow-hidden"
    >
      {/* Background Subtle Accent Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />
      {/* Ambient Liquid Blur Orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 top-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(245,237,0,0.05)_0%,transparent_70%)] blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* ========================================================================= */}
        {/* CHAPTER 1: ABOUT THAPAR VENTURE CLUB                                     */}
        {/* ========================================================================= */}
        <div data-home-beat className="mb-12 sm:mb-20 lg:mb-32">
          <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-4 sm:mb-6 rounded-full border border-white/[0.14] bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
            <span>01 // About The Organisation</span>
          </div>

          <h2
            id="about-title"
            className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f4f3ef] leading-[1.12] mb-6 sm:mb-10 lg:mb-14 max-w-4xl"
          >
            About Thapar Venture Club
          </h2>

          {/* Asymmetric 2-Column Statement with Frosted Card Framing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-16 items-start mb-8 sm:mb-12 lg:mb-16">
            <div className="lg:col-span-7">
              <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-light text-[#f4f3ef] leading-snug">
                Thapar Venture Club (TVC) is TIET&apos;s premier student-led entrepreneurship
                organisation, dedicated to building and strengthening the entrepreneurial ecosystem on
                campus.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 sm:space-y-4 rounded-xl border border-white/[0.1] bg-white/[0.025] backdrop-blur-xl p-4 sm:p-6 lg:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <p className="text-sm sm:text-lg text-[#a5a49f] leading-relaxed">
                We aim to empower students with the right knowledge, resources, mentorship and
                network to transform their ideas into meaningful ventures.
              </p>
              <div className="pt-3 sm:pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] sm:text-xs font-mono text-[#a5a49f]">
                <span>TIET PATIALA // OFFICIAL STUDENT SOCIETY</span>
                <span className="text-[#f5ed00] font-semibold">PUNJAB, INDIA</span>
              </div>
            </div>
          </div>

          {/* TVC photo archive carousel with glass card treatment */}
          <AboutPhotoCarousel />
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 2: WHAT WE STAND FOR (THE 4 PILLARS)                             */}
        {/* ========================================================================= */}
        <div data-home-beat className="mb-12 sm:mb-20 lg:mb-32 pt-8 sm:pt-14 lg:pt-16 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-14 lg:mb-20">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-2 sm:mb-3">
                Core Foundation
              </p>
              <h3 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f4f3ef]">
                What We Stand For
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#a5a49f] max-w-sm">
              Four enduring commitments shaping every initiative, workshop, and venture sprint at
              Thapar.
            </p>
          </div>

          {/* 4 Pillars Grid with Frosted Glass & Border Beam */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.num}
                  data-tvc-glass-card
                  className="tvc-glass-interactive group relative rounded-2xl border border-white/[0.13] bg-white/[0.035] hover:bg-white/[0.06] backdrop-blur-2xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between transition-all duration-300 shadow-[0_24px_64px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-[#f5ed00]/50"
                >
                  {/* Subtle Border Beam */}
                  {pillar.hasBeam && <div className="tvc-border-beam" />}

                  {/* Corner crosshairs */}
                  <div className="tvc-crosshair absolute top-3 left-3 text-[11px] font-mono text-white/20 select-none">+</div>
                  <div className="tvc-crosshair absolute top-3 right-3 text-[11px] font-mono text-white/20 select-none">+</div>
                  <div className="tvc-crosshair absolute bottom-3 left-3 text-[11px] font-mono text-white/20 select-none">+</div>
                  <div className="tvc-crosshair absolute bottom-3 right-3 text-[11px] font-mono text-white/20 select-none">+</div>

                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <span className="font-mono text-[11px] sm:text-xs text-[#f5ed00] font-semibold tracking-wider rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-[0_0_12px_rgba(245,237,0,0.2)]">
                        {pillar.num}
                      </span>
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-[#a5a49f] group-hover:text-[#f5ed00] group-hover:border-[#f5ed00]/40 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
                      </div>
                    </div>
                    <h4 className="font-mono text-base sm:text-xl font-medium uppercase tracking-wider text-[#f4f3ef] mb-2 sm:mb-3 group-hover:text-white transition-colors">
                      {pillar.name}
                    </h4>
                    <p className="text-xs sm:text-base text-[#a5a49f] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-8 pt-3 sm:pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] sm:text-xs font-mono text-white/45">
                    <span>{pillar.title}</span>
                    <span className="text-[#f5ed00] font-bold">•</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 3: OUR VISION (DEDICATED TYPOGRAPHIC MOMENT)                      */}
        {/* ========================================================================= */}
        <div
          data-home-beat
          className="my-12 sm:my-20 lg:my-32 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-24 bg-[#000000] border-y border-white/[0.14] relative overflow-hidden"
        >
          {/* Subtle golden ambient glow behind vision */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,237,0,0.08),transparent_70%)] animate-pulse"
          />

          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#f5ed00] mb-4 sm:mb-8 rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 backdrop-blur-md px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[0_0_20px_rgba(245,237,0,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#f5ed00]" />
              <span>Our Vision</span>
            </div>

            <blockquote className="tvc-gradient-text-flow text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.2] mb-5 sm:mb-8">
              &ldquo;To create an ecosystem where entrepreneurial thinking thrives, innovation is
              encouraged and students are equipped to become the next generation of leaders and
              changemakers.&rdquo;
            </blockquote>

            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#a5a49f]">
              Thapar Venture Club // Institutional North Star
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 4: WHAT DOES TVC DO? (4 INITIATIVE FEATURES + EXTENSIVE PHOTOS)   */}
        {/* ========================================================================= */}
        <div data-home-beat className="pt-4 sm:pt-8">
          <div className="max-w-3xl mb-8 sm:mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-3 sm:mb-4 rounded-full border border-white/[0.14] bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
              <span>Ecosystem Execution</span>
            </div>
            <h3 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f4f3ef] leading-[1.12] mb-3 sm:mb-6">
              What does TVC do?
            </h3>
            <p className="text-sm sm:text-lg text-[#a5a49f] leading-relaxed">
              At Thapar Venture Club, we go beyond introducing students to entrepreneurship. We
              create opportunities for them to learn, connect, compete and build.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-12 lg:space-y-16">
            {/* FEATURE 01: Flagship E-Summit */}
            <div
              data-tvc-glass-card
              className="relative overflow-hidden rounded-2xl border border-white/[0.13] bg-white/[0.03] backdrop-blur-2xl p-5 sm:p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center shadow-[0_30px_90px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/25 transition-all duration-300"
            >
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs text-[#f5ed00] uppercase tracking-widest mb-3 sm:mb-4">
                    <span className="rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold">
                      01 // Flagship Festival
                    </span>
                    <span>•</span>
                    <span className="text-white/60">Annual Landmark</span>
                  </div>
                  <h4 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-3 sm:mb-4">
                    Flagship E-Summit
                  </h4>
                  <p className="text-xs sm:text-base text-[#a5a49f] leading-relaxed mb-4 sm:mb-6">
                    Organising TIET&apos;s flagship entrepreneurship festival, featuring inspiring
                    speaker sessions, interactive Q&amp;A sessions, internship fairs, workshops and
                    networking opportunities.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-8">
                    {[
                      "Inspiring Speaker Sessions",
                      "Interactive Q&A Arenas",
                      "Campus Internship Fairs",
                      "Workshops & Networking",
                    ].map((feat) => (
                      <div
                        key={feat}
                        className="flex items-start gap-2 sm:gap-2.5 text-xs text-[#f4f3ef] rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-2 sm:p-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Link
                    href="/events/e-summit"
                    className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-black bg-[#f5ed00] hover:bg-[#fff957] px-4 py-2 sm:px-5 sm:py-3 rounded-sm font-semibold transition-all shadow-[0_0_20px_rgba(245,237,0,0.3)] hover:scale-[1.02]"
                  >
                    <span>Explore Flagship E-Summit</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>

              {/* Photography Placement 4: E-Summit Main Stage */}
              <div className="lg:col-span-6">
                <EditorialPhotoFrame
                  label="PHOTO 04 // E-SUMMIT AUDITORIUM"
                  imageSrc="/images/about/what-we-do-01.JPG"
                  location="AUDITORIUM COMPLEX"
                  caption="Reserved for official E-Summit photography: Mainstage keynotes, panel discussions, and packed auditorium crowds."
                  aspectRatio="aspect-[16/11]"
                />
              </div>
            </div>

            {/* FEATURE 02: Entre Hub & Skill Workshops */}
            <div
              data-tvc-glass-card
              className="relative overflow-hidden rounded-2xl border border-white/[0.13] bg-white/[0.03] backdrop-blur-2xl p-5 sm:p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center shadow-[0_30px_90px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/25 transition-all duration-300"
            >
              {/* Photography Placement 5: Skill Workshops on Left */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <EditorialPhotoFrame
                  label="PHOTO 05 // ENTRE HUB WORKSHOPS"
                  imageSrc="/images/about/what-we-do-02.jpeg"
                  location="CAMPUS LECTURE HALL"
                  caption="Reserved for hands-on skill workshops: BMC modeling, resume critiques, and interactive peer working groups."
                  aspectRatio="aspect-[4/5] lg:aspect-[3/4]"
                />
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs text-[#f5ed00] uppercase tracking-widest mb-3 sm:mb-4">
                    <span className="rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold">
                      02 // Skill Development
                    </span>
                    <span>•</span>
                    <span className="text-white/60">Applied Workshops</span>
                  </div>
                  <h4 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-3 sm:mb-4">
                    Entre Hub &amp; Skill Workshops
                  </h4>
                  <p className="text-xs sm:text-base text-[#a5a49f] leading-relaxed mb-4 sm:mb-6">
                    Upskilling students across essential business domains to build capable,
                    work-ready operators and startup founders.
                  </p>

                  {/* 4 Essential Business Domains */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                    {skillDomains.map((domain) => {
                      const Icon = domain.icon;
                      return (
                        <div
                          key={domain.title}
                          className="rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-3 sm:p-4 transition-all hover:border-[#f5ed00]/40"
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 mb-1 sm:mb-1.5">
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f5ed00]" />
                            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#f4f3ef] font-semibold">
                              {domain.title}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-[#a5a49f] leading-relaxed">
                            {domain.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs sm:text-sm text-[#f4f3ef] leading-relaxed mb-3 sm:mb-4">
                    We also conduct hands-on workshops covering{" "}
                    <span className="text-[#f5ed00]">Business Model Canvas (BMC)</span>, LinkedIn,
                    resume building and alumni networking.
                  </p>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-white/[0.08] flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-[#a5a49f]">
                  {["BMC Workshops", "LinkedIn Strategy", "Resume Building", "Alumni Networking"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.035] backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* FEATURE 03: PRIMUS'26 & High-Stakes Competitions */}
            <div
              data-tvc-glass-card
              className="relative overflow-hidden rounded-2xl border border-white/[0.13] bg-white/[0.03] backdrop-blur-2xl p-5 sm:p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center shadow-[0_30px_90px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/25 transition-all duration-300"
            >
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs text-[#f5ed00] uppercase tracking-widest mb-3 sm:mb-4">
                    <span className="rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold">
                      03 // National Competitions
                    </span>
                    <span>•</span>
                    <span className="text-white/60">Inter-Institutional</span>
                  </div>
                  <h4 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-3 sm:mb-4">
                    PRIMUS&apos;26 &amp; High-Stakes Competitions
                  </h4>
                  <p className="text-xs sm:text-base text-[#a5a49f] leading-relaxed mb-3 sm:mb-4">
                    Organising landmark annual competitions and national-level collaborations,
                    including partnerships with institutions such as{" "}
                    <span className="text-[#f4f3ef] font-medium">IIT Roorkee</span> and{" "}
                    <span className="text-[#f4f3ef] font-medium">Masters&apos; Union</span>.
                  </p>
                  <p className="text-xs sm:text-sm text-[#a5a49f] leading-relaxed mb-4 sm:mb-6">
                    Our events feature case competitions, business planning challenges and
                    B-Hackathons that encourage students to apply their knowledge to real-world
                    problems.
                  </p>

                  <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-8">
                    {[
                      {
                        title: "Case Competitions",
                        desc: "Evaluating strategic decision-making, market sizing, and industry problem statements.",
                        icon: Award,
                      },
                      {
                        title: "Business Planning Challenges",
                        desc: "Structuring viable business models, GTM roadmaps, and unit-economic feasibility.",
                        icon: Briefcase,
                      },
                      {
                        title: "B-Hackathons",
                        desc: "Rapid venture creation sprints testing speed, market validation, and prototype demo delivery.",
                        icon: Rocket,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-2.5 sm:p-3.5 transition-all hover:border-[#f5ed00]/40"
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#f4f3ef] font-semibold block">
                              {item.title}
                            </span>
                            <span className="text-[11px] sm:text-xs text-[#a5a49f]">{item.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Link
                    href="/events/tvc-x-sat"
                    className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#f5ed00] hover:text-white transition-colors"
                  >
                    <span>Learn About TVC x SAT Collaborations</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>

              {/* Photography Placement 6: Competitions Arena */}
              <div className="lg:col-span-6">
                <EditorialPhotoFrame
                  label="PHOTO 06 // CASE COMPETITIONS ARENA"
                  imageSrc="/images/about/what-we-do-03.jpeg"
                  location="COMPETITION AUDITORIUM"
                  caption="Reserved for TVC x SAT and case battle photography: High-stakes presentations, judging juries, and podium ceremonies."
                  aspectRatio="aspect-[16/11]"
                />
              </div>
            </div>

            {/* FEATURE 04: Venture Lab & Speaker Sessions */}
            <div
              data-tvc-glass-card
              className="relative overflow-hidden rounded-2xl border border-white/[0.13] bg-white/[0.03] backdrop-blur-2xl p-5 sm:p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center shadow-[0_30px_90px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/25 transition-all duration-300"
            >
              {/* Photography Placement 7: Speaker Sessions */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <EditorialPhotoFrame
                  label="PHOTO 07 // FIRESIDE SESSIONS"
                  imageSrc="/images/about/what-we-do-04.jpg"
                  location="AMPHITHEATRE"
                  caption="Reserved for guest speaker photography: Startup founders, unicorn entrepreneurs, and Shark Tank personalities in dialogue."
                  aspectRatio="aspect-[4/3] lg:aspect-[1/1]"
                />
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs text-[#f5ed00] uppercase tracking-widest mb-3 sm:mb-4">
                    <span className="rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold">
                      04 // Industry Immersion
                    </span>
                    <span>•</span>
                    <span className="text-white/60">Founder Dialogues</span>
                  </div>
                  <h4 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-3 sm:mb-4">
                    Venture Lab &amp; Speaker Sessions
                  </h4>
                  <p className="text-xs sm:text-base text-[#a5a49f] leading-relaxed mb-3 sm:mb-4">
                    Collaborating with incubators and bringing startup founders, unicorn
                    entrepreneurs, Shark Tank personalities and industry leaders to campus.
                  </p>
                  <p className="text-xs sm:text-sm text-[#a5a49f] leading-relaxed mb-5 sm:mb-8">
                    These interactions provide students with valuable insights into entrepreneurship,
                    business strategy, innovation and the startup ecosystem.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-8">
                    {[
                      { label: "Unicorn Founders", icon: Users },
                      { label: "Shark Tank Personalities", icon: Award },
                      { label: "Incubator Collaborations", icon: Briefcase },
                      { label: "Industry Leaders", icon: TrendingUp },
                    ].map((spk) => {
                      const Icon = spk.icon;
                      return (
                        <div
                          key={spk.label}
                          className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-2.5 sm:p-3 transition-all hover:border-[#f5ed00]/40"
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f5ed00]" />
                          <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#f4f3ef]">
                            {spk.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] sm:text-xs font-mono text-[#a5a49f]">
                  <span>TIET CAMPUS SESSIONS</span>
                  <Link
                    href="/speakers"
                    className="text-[#f5ed00] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>View Speaker Archives</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
