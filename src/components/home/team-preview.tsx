import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, User, Sparkles } from "lucide-react";
import { executiveBoardGroups } from "@/data/team";

export function TeamPreview() {
  const generalSecretaries =
    executiveBoardGroups.find((g) => g.id === "general-secretaries")?.members ?? [];

  return (
    <section
      id="team-preview"
      aria-labelledby="team-preview-title"
      className="relative bg-[#060605] text-[#f4f3ef] border-t border-white/[0.08] py-12 sm:py-20 lg:py-36 overflow-hidden"
    >
      {/* Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-[#f5ed00]/[0.04] blur-[140px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-14 lg:mb-20">
          <div>
            <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-3 sm:mb-4 rounded-full border border-white/[0.14] bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
              <span>02 // Executive Leadership</span>
            </div>
            <h2
              id="team-preview-title"
              className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f4f3ef]"
            >
              The leadership steering the collective.
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 sm:gap-3">
            <p className="text-xs sm:text-sm font-mono text-[#a5a49f]">
              [ Highest Leadership Grouping // Term 2026–2027 ]
            </p>
            <Link
              href="/team"
              className="group inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#f5ed00] hover:text-white transition-colors"
            >
              <span>View Full Executive Board &amp; Verticals</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

        {/* 3-Column General Secretaries Grid with Frosted Glass */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-14 lg:mb-16">
          {generalSecretaries.map((member) => (
            <div
              key={member.id}
              data-tvc-glass-card
              className="tvc-member-card tvc-glass-interactive group relative rounded-2xl border border-white/[0.13] bg-white/[0.035] backdrop-blur-2xl overflow-hidden flex flex-col transition-all duration-300 shadow-[0_24px_64px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-[#f5ed00]/50 hover:-translate-y-1.5"
            >
              {/* Corner crosshairs */}
              <div className="tvc-crosshair absolute top-3 left-3 text-[11px] font-mono text-white/30 z-10 select-none">+</div>
              <div className="tvc-crosshair absolute top-3 right-3 text-[11px] font-mono text-white/30 z-10 select-none">+</div>

              {/* Portrait Aspect Frame */}
              <div className="relative aspect-[4/3] xs:aspect-[4/5] sm:aspect-[3/4] max-h-[340px] sm:max-h-none w-full bg-gradient-to-b from-[#1b1b19] to-[#0f0f0e] border-b border-white/[0.08] overflow-hidden">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="tvc-member-photo object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                      <User className="w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                    <span className="mt-3 sm:mt-5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#a5a49f] bg-black/50 border border-white/[0.08] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xs">
                      Portrait coming soon
                    </span>
                  </div>
                )}
                {/* Frosted vignette overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none"
                />
              </div>

              {/* Member Meta */}
              <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="rounded-full border border-[#f5ed00]/30 bg-[#f5ed00]/10 px-2.5 py-0.5 sm:px-3 sm:py-0.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#f5ed00] font-semibold shadow-[0_0_12px_rgba(245,237,0,0.15)]">
                      {member.position}
                    </span>
                  </div>
                  <h3 className="font-medium text-base sm:text-lg text-[#f4f3ef] mb-1 tracking-tight group-hover:text-white transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#a5a49f] leading-relaxed">
                    Executive Board
                  </p>
                </div>

                <div className="mt-4 sm:mt-5 pt-2.5 sm:pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-white/45">
                  <span>TIET PATIALA</span>
                  <span className="text-[#f5ed00]/80">{member.image ? "EXECUTIVE BOARD" : "PORTRAIT TBC"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner with Frosted Glass */}
        <div
          data-tvc-glass-card
          className="p-5 sm:p-8 lg:p-12 rounded-2xl border border-white/[0.14] bg-white/[0.035] backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/60 to-transparent"
          />
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#f5ed00] mb-1.5 sm:mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COHORT INTAKE</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-medium tracking-tight text-[#f4f3ef] mb-1 sm:mb-1.5">
              Interested in shaping the next venture cohort?
            </h3>
            <p className="text-xs sm:text-sm text-[#a5a49f] max-w-xl">
              Recruitment cycles for student leads, operations managers, and technical fellows open
              each academic term.
            </p>
          </div>
          <Link
            href="/team"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#f5ed00] hover:bg-[#fff957] text-black font-semibold text-xs font-mono uppercase tracking-widest px-5 py-3 sm:px-6 sm:py-3.5 rounded-full transition-all shadow-[0_0_24px_rgba(245,237,0,0.25)] hover:scale-[1.02]"
          >
            <span>Meet All 17 Board Members</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
