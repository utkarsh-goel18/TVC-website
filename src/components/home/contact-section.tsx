import { siteConfig } from "@/lib/site";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative bg-[#060605] text-[#f4f3ef] border-t border-white/[0.08] py-12 sm:py-20 lg:py-32 overflow-hidden"
    >
      {/* Ambient Liquid Blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#f5ed00]/[0.04] blur-[130px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-16 items-start">
          {/* Headline Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#a5a49f] mb-3 sm:mb-6 rounded-full border border-white/[0.14] bg-white/[0.04] backdrop-blur-xl px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5ed00] shadow-[0_0_8px_#f5ed00]" />
              <span>03 // Get In Touch</span>
            </div>
            <h2
              id="contact-title"
              className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#f4f3ef] leading-[1.12] mb-3 sm:mb-6"
            >
              Got queries?
            </h2>
            <p className="text-sm sm:text-lg text-[#a5a49f] leading-relaxed max-w-xl">
              Have a question, want to collaborate, or simply want to know more about Thapar
              Venture Club? We&apos;d love to hear from you. Drop us a message and we&apos;ll get
              back to you.
            </p>
          </div>

          {/* Details / Channels Column with Frosted Glass Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
            {/* Email Card */}
            <div
              data-tvc-glass-card
              className="tvc-glass-interactive rounded-2xl border border-white/[0.14] bg-white/[0.035] backdrop-blur-2xl p-4 sm:p-8 flex flex-col justify-between shadow-[0_24px_64px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-[#f5ed00]/50 transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-2.5 font-mono text-xs text-[#a5a49f] mb-2 sm:mb-3">
                  <div className="h-7 w-7 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-[#f5ed00]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-white/80">DROP US A MAIL</span>
                </div>
                <h3 className="font-mono text-base sm:text-xl font-medium text-[#f4f3ef] mb-1.5 sm:mb-2 break-all">
                  {siteConfig.contactEmail}
                </h3>
                <p className="text-xs text-[#a5a49f]">
                  For general queries, collaborations and everything TVC.
                </p>
              </div>

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/[0.08]">
                <a
                  href="https://mail.google.com/mail/?view=cm&to=edc%40thapar.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#f5ed00] hover:text-white transition-colors"
                >
                  <span>Send Us An Email</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Campus Location Card */}
            <div
              data-tvc-glass-card
              className="tvc-glass-interactive rounded-2xl border border-white/[0.14] bg-white/[0.035] backdrop-blur-2xl p-4 sm:p-8 flex flex-col justify-between shadow-[0_24px_64px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-center text-[#f5ed00] shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[#f4f3ef] mb-1 font-semibold">
                    {siteConfig.institution}
                  </h4>
                  <p className="text-xs text-[#a5a49f] leading-relaxed">{siteConfig.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
