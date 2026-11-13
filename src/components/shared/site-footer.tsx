import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#000000] border-t border-white/[0.08] text-[#a5a49f] relative overflow-hidden">
      {/* Subtle background ambient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#f5ed00]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/[0.08]">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <Image
                    src="/brand/tvc-rocket-emblem.png"
                    alt="TVC Emblem"
                    fill
                    sizes="36px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#f4f3ef] tracking-tight">
                    Thapar Venture Club
                  </h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-[#a5a49f]">
                    TIET Patiala
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6 text-[#a5a49f]">
                The premier student-led venture and entrepreneurship organisation at Thapar Institute
                of Engineering & Technology. Cultivating founders, builders, and ecosystem leaders.
              </p>
            </div>

            <div className="pt-4">
              <span className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-[#f4f3ef] bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-sm">
                Ideate • Ascend • Lead
              </span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-2">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#f4f3ef] mb-5">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-[#f4f3ef] transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Initiatives Column */}
          <div className="md:col-span-2">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#f4f3ef] mb-5">
              Initiatives
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/events/e-summit"
                  className="hover:text-[#f4f3ef] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                >
                  <span>Flagship E-Summit</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events/tvc-x-sat"
                  className="hover:text-[#f4f3ef] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                >
                  <span>PRIMUS&apos;26</span>
                </Link>
              </li>
              <li>
                <span className="text-[#a5a49f]">Entre Hub Workshops</span>
              </li>
              <li>
                <span className="text-[#a5a49f]">Venture Lab</span>
              </li>
            </ul>
          </div>

          {/* Socials & Contact Column */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#f4f3ef] mb-5">
              Connect & Channels
            </h4>
            <ul className="flex flex-col gap-3 text-sm mb-6">
              {siteConfig.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#f4f3ef] transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                  >
                    <span>{social.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-white/[0.08]">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#a5a49f] mb-1">
                Official Inquiries
              </p>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-mono text-xs text-[#f4f3ef] hover:text-[#f5ed00] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Footer Meta & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
          <p>© {new Date().getFullYear()} Thapar Venture Club. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#a5a49f]">
            <span>{siteConfig.institution}</span>
            <span className="text-white/20">•</span>
            <span>Patiala, Punjab, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
