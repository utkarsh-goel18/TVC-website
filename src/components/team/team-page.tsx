import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { executiveBoardGroups } from "@/data/team";
import { MemberCard } from "@/components/team/member-card";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { TeamPhotoSequence } from "@/components/team/team-photo-sequence";

export function TeamPage() {
  const allMembers = executiveBoardGroups.flatMap((group) => group.members);
  const memberOrder = [
    "sanchit-sehgal",
    "shashank-jain",
    "devyansh-arya",
    "aadish-jain",
    "parth-gakhar",
    "lakshya-goyal",
    "nimitt-malhotra",
    "nishtha-saha",
    "liya",
    "namandeep-jindal",
    "sparsh-gupta",
    "bhuvan-malhotra",
    "vidhi-saxena",
    "vansh-goyal",
    "vasu-garg",
    "ruhan-garg",
    "vishesh-nagpure",
  ];
  const members = memberOrder.flatMap((id) => {
    const member = allMembers.find((item) => item.id === id);
    return member ? [member] : [];
  });
  const leadership = members.filter((member) =>
    ["sanchit-sehgal", "shashank-jain", "devyansh-arya"].includes(member.id),
  );
  const boardMembers = members.filter(
    (member) => !leadership.some((leader) => leader.id === member.id),
  );

  return (
    <div className="min-h-screen bg-[#000000] text-[#f4f3ef] flex flex-col selection:bg-[#f5ed00] selection:text-black">
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <TeamPhotoSequence />

        <section aria-labelledby="team-hero-heading" className="relative overflow-hidden border-b border-white/[0.08] py-24 sm:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_25%,rgba(245,237,0,0.055),transparent_70%)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-10">
              <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#a5a49f] transition-colors hover:text-[#f5ed00]">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Home
              </Link>
            </div>
            <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
              <div className="max-w-4xl">
                <p className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5ed00]">
                  <span className="h-px w-8 bg-[#f5ed00]" /> The people behind TVC
                </p>
                <h1 id="team-hero-heading" className="text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.075em] text-[#f4f3ef]">
                  The people behind
                  <br />
                  <span className="text-white/35">every big idea.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                  Meet the people building connections, creating opportunities and moving the entrepreneurial ecosystem at Thapar Institute forward.
                </p>
              </div>
              <div className="flex shrink-0 items-end justify-between gap-8 border-t border-white/15 pt-5 md:min-w-48 md:flex-col md:items-end md:border-l md:border-t-0 md:pb-1 md:pl-8 md:pt-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">Executive term</span>
                <span className="font-mono text-sm tracking-wider text-[#f5ed00]">2026 — 2027</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="team-collective-heading" className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-14 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5ed00]">The 2026 — 2027 collective</p>
              <h2 id="team-collective-heading" className="text-3xl font-medium tracking-[-0.055em] sm:text-5xl">One team. Many perspectives<span className="text-[#f5ed00]">.</span></h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">Different strengths, shared ambition. Meet everyone who makes the TVC community what it is.</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{String(members.length).padStart(2, "0")} people · one community</span>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="relative overflow-hidden border border-white/10 bg-[#11110f] p-8 sm:p-12 lg:p-16">
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#f5ed00]/10" />
            <div aria-hidden="true" className="absolute -right-5 -top-12 h-52 w-52 rounded-full border border-white/[0.06]" />
            <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5ed00]">Your story could start here</p>
                <h3 className="max-w-2xl text-3xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-5xl">Good things happen when ambitious people meet.</h3>
                <p className="mt-5 max-w-xl text-sm leading-6 text-white/50">Reach out to learn more about TVC, upcoming opportunities and ways to get involved.</p>
              </div>
              <a href="https://mail.google.com/mail/?view=cm&to=edc%40thapar.edu" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-3 bg-[#f5ed00] px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white">
                Get in touch <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
