import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const archive = [
  { src: "/images/about/TVC-01.png", label: "The community", size: "md:col-span-5 md:row-span-2" },
  { src: "/images/team/tvc-team-02.png", label: "The people", size: "md:col-span-3" },
  { src: "/images/about/TVC-03.jpeg", label: "The conversations", size: "md:col-span-4" },
  { src: "/images/esummit/team/team-03.jpeg", label: "The summit", size: "md:col-span-4" },
  { src: "/images/about/TVC-05.JPG", label: "The moments", size: "md:col-span-4" },
];

export function HomeArchive() {
  return (
    <section id="archive" className="relative overflow-hidden border-y border-white/10 bg-[#050505] py-24 sm:py-32 lg:py-40">
      <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#f5ed00]/[0.035] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.32em] text-[#f5ed00]">TVC / The archive</p>
            <h2 className="text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#f4f3ef] sm:text-6xl lg:text-7xl">
              More than a club.
              <span className="block text-white/35">A culture in motion.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/50">
            The people, conversations and moments that turn ambition into action at Thapar.
          </p>
        </div>

        <div className="grid auto-rows-[190px] grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[220px] md:grid-cols-12">
          {archive.map((item, index) => (
            <figure key={item.src} className={`group relative isolate overflow-hidden bg-[#151513] ${item.size} `}>
              <Image
                src={item.src}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="z-0 object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.045]"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
              <figcaption className="absolute bottom-4 z-20 left-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 sm:bottom-5 sm:left-5">
                <span className="text-[#f5ed00]">0{index + 1}</span>
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">A living archive of TVC</span>
          <Link href="/events" className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#f5ed00] transition-colors hover:text-white">
            Explore our experiences <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
