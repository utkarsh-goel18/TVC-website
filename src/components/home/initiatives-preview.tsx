"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ArrowUpRight, Calendar } from "lucide-react";

const initiativeImages: Record<string, string> = {
  "tvc-x-sat": "/images/about/what-we-do-03.jpeg",
  "e-summit": "/images/about/what-we-do-01.JPG",
};

export function InitiativesPreview() {
  return (
    <section id="initiatives" aria-labelledby="initiatives-title" className="relative overflow-hidden border-t border-white/10 bg-[#0b0b0a] py-24 text-[#f4f3ef] sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.32em] text-[#f5ed00]">TVC / Signature experiences</p>
            <h2 id="initiatives-title" className="max-w-3xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              We don't just talk
              <span className="block text-white/35">about ideas. We build around them.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/50">
            Platforms that bring ambitious students, founders and industry together.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {siteConfig.initiatives.map((item, index) => (
            <article key={item.id} className="group relative isolate flex min-h-[460px] flex-col justify-between overflow-hidden border border-white/10 bg-[#141413] p-7 sm:min-h-[560px] sm:p-10">
              <Image src={initiativeImages[item.id]} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="absolute inset-0 -z-20 object-cover opacity-55 transition-transform duration-1000 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/65 via-black/20 to-black/90" />
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5ed00]">0{index + 1} / {item.badge}</span>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/65"><Calendar className="h-3.5 w-3.5" />{item.dateStatus}</span>
              </div>
              <div className="max-w-xl">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">{item.edition}</p>
                <h3 className="mb-4 text-3xl font-medium leading-[1.02] tracking-tight text-white sm:text-5xl">{item.title}</h3>
                <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base">{item.descriptor}</p>
                <Link href={item.href} className="mt-8 inline-flex items-center gap-3 border-b border-[#f5ed00]/60 pb-2 text-xs font-mono uppercase tracking-[0.16em] text-[#f5ed00] transition-colors hover:border-white hover:text-white">
                  Explore experience <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
