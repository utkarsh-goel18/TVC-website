"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { Menu, X, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-[#f5ed00] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>

      <header
        className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "border-b border-white/[0.08] bg-[#070706]/85 shadow-[0_4px_30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
            : "border-b border-white/[0.04] bg-[#070706]/60 backdrop-blur-xl"
        }`}
      >
        {/* Subtle Specular Top Highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5ed00]/30 to-transparent"
        />

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-6 sm:h-16 sm:px-10 lg:px-16">
          <Link
            href="/"
            className="group flex flex-shrink-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
            aria-label="Thapar Venture Club — Home"
          >
            <div className="relative h-6 w-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7 filter drop-shadow-[0_0_12px_rgba(245,237,0,0.25)]">
              <Image
                src="/brand/tvc-rocket-emblem.png"
                alt="TVC"
                fill
                sizes="28px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tracking-tight text-[#e8e7e3] transition-colors duration-200 group-hover:text-white sm:text-[15px]">
                Thapar Venture Club
              </span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5ed00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f5ed00]"></span>
              </span>
            </div>
          </Link>

          <nav
            aria-label="Main navigation"
            className="ml-auto hidden items-center gap-1 md:flex"
          >
            {siteConfig.navigation.map((item) => {
              const isActive = pathname === item.href;
              const bracketClass = isActive
                ? "opacity-100"
                : "nav-item-bracket opacity-0 transition-opacity duration-150 group-hover/navitem:opacity-100";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`nav-item group/navitem relative rounded-sm px-5 py-2 text-[13px] font-normal tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f5ed00] ${
                    isActive
                      ? "text-[#f5ed00] font-semibold"
                      : "text-[#9e9d99] hover:text-[#e8e7e3]"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute top-0.5 left-1 h-2 w-2 border-t border-l border-[#f5ed00] ${bracketClass}`}
                  />
                  <span
                    className={`pointer-events-none absolute top-0.5 right-1 h-2 w-2 border-t border-r border-[#f5ed00] ${bracketClass}`}
                  />
                  <span
                    className={`pointer-events-none absolute bottom-0.5 left-1 h-2 w-2 border-b border-l border-[#f5ed00] ${bracketClass}`}
                  />
                  <span
                    className={`pointer-events-none absolute right-1 bottom-0.5 h-2 w-2 border-r border-b border-[#f5ed00] ${bracketClass}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/#contact"
            className="tvc-header-cta hidden flex-shrink-0 items-center gap-2 rounded-full border border-[#f5ed00]/50 bg-[#f5ed00]/10 hover:bg-[#f5ed00] hover:text-black backdrop-blur-md px-5 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#f5ed00] transition-all duration-300 shadow-[0_0_16px_rgba(245,237,0,0.15)] hover:shadow-[0_0_24px_rgba(245,237,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-xs md:inline-flex"
          >
            LET&apos;S CONNECT <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-[#9e9d99] backdrop-blur-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00] md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0a0a0a]/98 p-6 pt-20 backdrop-blur-2xl md:hidden"
        >
          <div className="absolute top-4 right-5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-[#9e9d99] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
              aria-label="Close navigation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/[0.07] pb-5">
              <div className="relative h-7 w-7 flex-shrink-0">
                <Image
                  src="/brand/tvc-rocket-emblem.png"
                  alt="TVC"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#e8e7e3]">
                  Thapar Venture Club
                </p>
                <p className="mt-0.5 font-mono text-[10px] tracking-widest text-[#6b6a66] uppercase">
                  Ideate. Ascend. Lead.
                </p>
              </div>
            </div>

            <nav
              className="flex flex-col"
              aria-label="Mobile navigation links"
            >
              {siteConfig.navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between border-b border-white/[0.05] py-4 text-xl font-medium tracking-tight transition-colors ${
                      isActive
                        ? "text-[#f5ed00]"
                        : "text-[#e8e7e3] hover:text-[#f5ed00]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#6b6a66]" />
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-fit items-center gap-3 rounded-full border border-[#f5ed00] bg-[#f5ed00] px-6 py-3.5 font-mono text-xs font-semibold tracking-[0.14em] text-black transition-all shadow-[0_0_20px_rgba(245,237,0,0.3)] hover:bg-[#ded700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              LET&apos;S CONNECT <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-5 font-mono text-xs text-[#6b6a66]">
            <p>Thapar Institute of Engineering &amp; Technology</p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-[#9e9d99] transition-colors hover:text-[#f5ed00]"
            >
              {siteConfig.contactEmail}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
