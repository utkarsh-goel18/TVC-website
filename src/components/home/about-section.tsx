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
      className={`group relative bg-[#141413] border border-white/[0.08] hover:border-[#f5ed00]/40 rounded-sm overflow-hidden flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 ${aspectRatio} ${className}`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/45" />
      {/* Corner crosshairs */}
      <div className="absolute top-2 left-2 text-[10px] font-mono text-white/20 select-none z-10">+</div>
      <div className="absolute top-2 right-2 text-[10px] font-mono text-white/20 select-none z-10">+</div>
      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/20 select-none z-10">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/20 select-none z-10">+</div>

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-[#a5a49f]">
        <span className="tracking-wider uppercase">{label}</span>
        <span className="text-white/40">{location}</span>
      </div>

      {!imageSrc ? (
        <div className="relative z-10 my-auto text-center py-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full border border-white/10 flex items-center justify-center text-[#f5ed00]">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
          </div>
          <p className="font-mono text-[11px] sm:text-xs text-[#a5a49f] max-w-xs mx-auto leading-relaxed">
            {caption}
          </p>
        </div>
      ) : null}

      {/* Bottom Metadata Strip */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
        <span className="text-[#f4f3ef]/80">Official Documentation</span>
        <span className="text-[#f5ed00]/80">{imageSrc ? "TVC ARCHIVE" : "Archive Selection TBC"}</span>
      </div>
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
    },
    {
      num: "02",
      name: "ASCEND",
      title: "Empowering founder trajectories",
      description:
        "Empowering students through industry mentorship, valuable resources and founder networks to turn ideas into reality.",
      icon: Rocket,
    },
    {
      num: "03",
      name: "LEAD",
      title: "Creating the future",
      description:
        "Building a community of dreamers, doers and risk-takers who don't just prepare for the future — they create it.",
      icon: ShieldCheck,
    },
    {
      num: "04",
      name: "BUILD THE NETWORK",
      title: "Catalysing connections",
      description:
        "Connecting ambitious peers, TIET alumni, founders and industry leaders to create opportunities for collaboration and growth.",
      icon: Share2,
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
      className="relative bg-[#0b0b0a] text-[#f4f3ef] border-t border-white/[0.08] py-28 sm:py-36 lg:py-44 overflow-hidden"
    >
      {/* Background Subtle Accent Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* ========================================================================= */}
        {/* CHAPTER 1: ABOUT THAPAR VENTURE CLUB                                     */}
        {/* ========================================================================= */}
        <div data-home-beat className="mb-28 sm:mb-36">
          <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-6 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5ed00]" />
            <span>01 // About The Organisation</span>
          </div>

          <h2
            id="about-title"
            className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f4f3ef] leading-[1.12] mb-12 sm:mb-16 max-w-4xl"
          >
            About Thapar Venture Club
          </h2>

          {/* Asymmetric 2-Column Statement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-14 sm:mb-16">
            <div className="lg:col-span-7">
              <p className="text-xl sm:text-2xl lg:text-3xl font-light text-[#f4f3ef] leading-snug">
                Thapar Venture Club (TVC) is TIET&apos;s premier student-led entrepreneurship
                organisation, dedicated to building and strengthening the entrepreneurial ecosystem on
                campus.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <p className="text-base sm:text-lg text-[#a5a49f] leading-relaxed">
                We aim to empower students with the right knowledge, resources, mentorship and
                network to transform their ideas into meaningful ventures.
              </p>
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#a5a49f]">
                <span>TIET PATIALA // OFFICIAL STUDENT SOCIETY</span>
                <span className="text-[#f5ed00]">PUNJAB, INDIA</span>
              </div>
            </div>
          </div>

          {/* TVC photo archive carousel — upload images to public/images/about */}
          <AboutPhotoCarousel />
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 2: WHAT WE STAND FOR (THE 4 PILLARS)                             */}
        {/* ========================================================================= */}
        <div data-home-beat className="mb-28 sm:mb-36 pt-16 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-20">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-3">
                Core Foundation
              </p>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f4f3ef]">
                What We Stand For
              </h3>
            </div>
            <p className="text-sm font-mono text-[#a5a49f] max-w-sm">
              Four enduring commitments shaping every initiative, workshop, and venture sprint at
              Thapar.
            </p>
          </div>

          {/* 4 Pillars Grid with Dual Flanking Photo Frames */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.num}
                  className="group relative bg-[#141413] hover:bg-[#1a1a18] border border-white/[0.08] hover:border-[#f5ed00]/40 rounded-sm p-8 sm:p-10 flex flex-col justify-between transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs text-[#f5ed00] font-semibold tracking-wider">
                        {pillar.num}
                      </span>
                      <Icon className="w-5 h-5 text-[#a5a49f] group-hover:text-[#f5ed00] transition-colors" />
                    </div>
                    <h4 className="font-mono text-lg sm:text-xl font-medium uppercase tracking-wider text-[#f4f3ef] mb-3">
                      {pillar.name}
                    </h4>
                    <p className="text-sm sm:text-base text-[#a5a49f] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-white/40">
                    <span>{pillar.title}</span>
                    <span className="text-[#f5ed00]/80">•</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 3: OUR VISION (DEDICATED TYPOGRAPHIC MOMENT)                      */}
        {/* ========================================================================= */}
        <div data-home-beat className="my-28 sm:my-36 -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-20 sm:py-28 bg-[#000000] border-y border-white/[0.12] relative overflow-hidden">
          {/* Subtle golden ambient glow behind vision */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,237,0,0.04),transparent_70%)]"
          />

          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#f5ed00] mb-8 bg-[#f5ed00]/10 border border-[#f5ed00]/20 px-3.5 py-1.5 rounded-full">
              <span>Our Vision</span>
            </div>

            <blockquote className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#f4f3ef] tracking-tight leading-[1.2] mb-8">
              &ldquo;To create an ecosystem where entrepreneurial thinking thrives, innovation is
              encouraged and students are equipped to become the next generation of leaders and
              changemakers.&rdquo;
            </blockquote>

            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#a5a49f]">
              Thapar Venture Club // Institutional North Star
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 4: WHAT DOES TVC DO? (4 INITIATIVE FEATURES + EXTENSIVE PHOTOS)   */}
        {/* ========================================================================= */}
        <div data-home-beat className="pt-8">
          <div className="max-w-3xl mb-16 sm:mb-24">
            <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-4 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5ed00]" />
              <span>Ecosystem Execution</span>
            </div>
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f4f3ef] leading-[1.12] mb-6">
              What does TVC do?
            </h3>
            <p className="text-base sm:text-lg text-[#a5a49f] leading-relaxed">
              At Thapar Venture Club, we go beyond introducing students to entrepreneurship. We
              create opportunities for them to learn, connect, compete and build.
            </p>
          </div>

          <div className="space-y-16 sm:space-y-24">
            {/* FEATURE 01: Flagship E-Summit */}
            <div className="bg-[#141413] border border-white/[0.08] rounded-sm p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 font-mono text-xs text-[#f5ed00] uppercase tracking-widest mb-4">
                    <span>01 // Flagship Festival</span>
                    <span>•</span>
                    <span>Annual Landmark</span>
                  </div>
                  <h4 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-4">
                    Flagship E-Summit
                  </h4>
                  <p className="text-base text-[#a5a49f] leading-relaxed mb-6">
                    Organising TIET&apos;s flagship entrepreneurship festival, featuring inspiring
                    speaker sessions, interactive Q&amp;A sessions, internship fairs, workshops and
                    networking opportunities.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <div className="flex items-start gap-2.5 text-xs text-[#f4f3ef]">
                      <CheckCircle2 className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <span>Inspiring Speaker Sessions</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#f4f3ef]">
                      <CheckCircle2 className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <span>Interactive Q&amp;A Arenas</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#f4f3ef]">
                      <CheckCircle2 className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <span>Campus Internship Fairs</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#f4f3ef]">
                      <CheckCircle2 className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <span>Workshops &amp; Networking</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href="/events/e-summit"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black bg-[#f5ed00] hover:bg-[#fff957] px-5 py-3 rounded-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Explore Flagship E-Summit</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Photography Placement 4: E-Summit Main Stage */}
              <div className="lg:col-span-6">
                <EditorialPhotoFrame
                  label="PHOTO 04 // E-SUMMIT AUDITORIUM"
                  imageSrc="/images/about/what-we-do-01.jpg"
                  location="AUDITORIUM COMPLEX"
                  caption="Reserved for official E-Summit photography: Mainstage keynotes, panel discussions, and packed auditorium crowds."
                  aspectRatio="aspect-[16/11]"
                />
              </div>
            </div>

            {/* FEATURE 02: Entre Hub & Skill Workshops */}
            <div className="bg-[#141413] border border-white/[0.08] rounded-sm p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Photography Placement 5: Skill Workshops on Left */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <EditorialPhotoFrame
                  label="PHOTO 05 // ENTRE HUB WORKSHOPS"
                  location="CAMPUS LECTURE HALL"
                  caption="Reserved for hands-on skill workshops: BMC modeling, resume critiques, and interactive peer working groups."
                  aspectRatio="aspect-[4/5] lg:aspect-[3/4]"
                />
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 font-mono text-xs text-[#f5ed00] uppercase tracking-widest mb-4">
                    <span>02 // Skill Development</span>
                    <span>•</span>
                    <span>Applied Workshops</span>
                  </div>
                  <h4 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-4">
                    Entre Hub &amp; Skill Workshops
                  </h4>
                  <p className="text-base text-[#a5a49f] leading-relaxed mb-6">
                    Upskilling students across essential business domains to build capable,
                    work-ready operators and startup founders.
                  </p>

                  {/* 4 Essential Business Domains */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {skillDomains.map((domain) => {
                      const Icon = domain.icon;
                      return (
                        <div
                          key={domain.title}
                          className="bg-black/40 border border-white/[0.06] p-4 rounded-sm"
                        >
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <Icon className="w-4 h-4 text-[#f5ed00]" />
                            <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef] font-semibold">
                              {domain.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#a5a49f] leading-relaxed">
                            {domain.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-sm text-[#f4f3ef] leading-relaxed mb-4">
                    We also conduct hands-on workshops covering{" "}
                    <span className="text-[#f5ed00]">Business Model Canvas (BMC)</span>, LinkedIn,
                    resume building and alumni networking.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex flex-wrap gap-2 text-xs font-mono text-[#a5a49f]">
                  <span className="bg-white/[0.04] px-2.5 py-1 rounded-xs border border-white/[0.06]">
                    BMC Workshops
                  </span>
                  <span className="bg-white/[0.04] px-2.5 py-1 rounded-xs border border-white/[0.06]">
                    LinkedIn Strategy
                  </span>
                  <span className="bg-white/[0.04] px-2.5 py-1 rounded-xs border border-white/[0.06]">
                    Resume Building
                  </span>
                  <span className="bg-white/[0.04] px-2.5 py-1 rounded-xs border border-white/[0.06]">
                    Alumni Networking
                  </span>
                </div>
              </div>
            </div>

            {/* FEATURE 03: TVC x SAT & High-Stakes Competitions */}
            <div className="bg-[#141413] border border-white/[0.08] rounded-sm p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 font-mono text-xs text-[#f5ed00] uppercase tracking-widest mb-4">
                    <span>03 // National Competitions</span>
                    <span>•</span>
                    <span>Inter-Institutional</span>
                  </div>
                  <h4 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-4">
                    PRISM'26 &amp; High-Stakes Competitions
                  </h4>
                  <p className="text-base text-[#a5a49f] leading-relaxed mb-4">
                    Organising landmark annual competitions and national-level collaborations,
                    including partnerships with institutions such as{" "}
                    <span className="text-[#f4f3ef] font-medium">IIT Roorkee</span> and{" "}
                    <span className="text-[#f4f3ef] font-medium">Masters&apos; Union</span>.
                  </p>
                  <p className="text-sm text-[#a5a49f] leading-relaxed mb-6">
                    Our events feature case competitions, business planning challenges and
                    B-Hackathons that encourage students to apply their knowledge to real-world
                    problems.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <Award className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef] font-semibold block">
                          Case Competitions
                        </span>
                        <span className="text-xs text-[#a5a49f]">
                          Evaluating strategic decision-making, market sizing, and industry problem
                          statements.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <Briefcase className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef] font-semibold block">
                          Business Planning Challenges
                        </span>
                        <span className="text-xs text-[#a5a49f]">
                          Structuring viable business models, GTM roadmaps, and unit-economic
                          feasibility.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <Rocket className="w-4 h-4 text-[#f5ed00] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef] font-semibold block">
                          B-Hackathons
                        </span>
                        <span className="text-xs text-[#a5a49f]">
                          Rapid venture creation sprints testing speed, market validation, and
                          prototype demo delivery.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href="/events/tvc-x-sat"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#f5ed00] hover:text-white transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    <span>Learn About TVC x SAT Collaborations</span>
                    <ArrowUpRight className="w-4 h-4" />
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
            <div className="bg-[#141413] border border-white/[0.08] rounded-sm p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
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
                  <div className="flex items-center gap-3 font-mono text-xs text-[#f5ed00] uppercase tracking-widest mb-4">
                    <span>04 // Industry Immersion</span>
                    <span>•</span>
                    <span>Founder Dialogues</span>
                  </div>
                  <h4 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#f4f3ef] mb-4">
                    Venture Lab &amp; Speaker Sessions
                  </h4>
                  <p className="text-base text-[#a5a49f] leading-relaxed mb-4">
                    Collaborating with incubators and bringing startup founders, unicorn
                    entrepreneurs, Shark Tank personalities and industry leaders to campus.
                  </p>
                  <p className="text-sm text-[#a5a49f] leading-relaxed mb-8">
                    These interactions provide students with valuable insights into entrepreneurship,
                    business strategy, innovation and the startup ecosystem.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <div className="flex items-center gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <Users className="w-4 h-4 text-[#f5ed00]" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef]">
                        Unicorn Founders
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <Award className="w-4 h-4 text-[#f5ed00]" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef]">
                        Shark Tank Personalities
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <Briefcase className="w-4 h-4 text-[#f5ed00]" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef]">
                        Incubator Collaborations
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/[0.06] p-3 rounded-sm">
                      <TrendingUp className="w-4 h-4 text-[#f5ed00]" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef]">
                        Industry Leaders
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#a5a49f]">
                  <span>TIET CAMPUS SESSIONS</span>
                  <Link
                    href="/speakers"
                    className="text-[#f5ed00] hover:text-white transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
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
