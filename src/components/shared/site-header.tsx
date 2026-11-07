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
            ? "border-b border-white/[0.06] bg-[#0d0d0d]/95 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
            : "border-b border-white/[0.04] bg-[#0d0d0d]/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-6 sm:h-16 sm:px-10 lg:px-16">
          <Link
            href="/"
            className="group flex flex-shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
            aria-label="Thapar Venture Club — Home"
          >
            <div className="relative h-6 w-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-7 sm:w-7">
              <Image
                src="/brand/tvc-rocket-emblem.png"
                alt="TVC"
                fill
                sizes="28px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm font-medium tracking-tight text-[#e8e7e3] transition-colors duration-200 group-hover:text-white sm:text-[15px]">
              Thapar Venture Club
            </span>
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
                      ? "text-[#f5ed00]"
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

          <a
            href={`mailto:${siteConfig.contactEmail}?subject=Thapar%20Venture%20Club%20Enquiry`}
            className="tvc-header-cta hidden flex-shrink-0 items-center gap-2 border border-[#f5ed00]/60 px-4 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#f5ed00] transition-all duration-300 hover:border-[#f5ed00] hover:bg-[#f5ed00] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-5 sm:text-xs md:inline-flex"
          >
            LET'S CONNECT <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-sm p-2 text-[#9e9d99] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00] md:hidden"
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
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0a0a0a]/98 p-6 pt-20 backdrop-blur-xl md:hidden"
        >
          <div className="absolute top-4 right-5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-sm p-2 text-[#9e9d99] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5ed00]"
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

            <a
              href={`mailto:${siteConfig.contactEmail}?subject=Thapar%20Venture%20Club%20Enquiry`}
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-fit items-center gap-3 border border-[#f5ed00] bg-[#f5ed00] px-5 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-black transition-colors hover:bg-[#ded700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              LET'S CONNECT <ArrowUpRight className="h-4 w-4" />
            </a>
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
