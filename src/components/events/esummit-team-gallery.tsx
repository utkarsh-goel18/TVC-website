"use client";

const photos = Array.from({ length: 9 }, (_, index) => ({
  number: String(index + 1).padStart(2, "0"),
  wide: index === 0 || index === 5,
  featured: index === 8,
}));

export function ESummitTeamGallery() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {photos.map(({ number, wide, featured }) => (
        <div
          key={number}
          className={`group relative overflow-hidden border border-white/10 bg-[#10100f] ${featured ? "col-span-2 aspect-[8/5] sm:col-span-2 sm:aspect-[8/5]" : wide ? "col-span-2 aspect-[2/1]" : "aspect-[4/5]"}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_45%,rgba(245,237,0,0.07),transparent_65%)]">
            <span className="font-mono text-3xl text-white/15">{number}</span>
            <span className="mt-2 font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">Team photograph</span>
          </div>
          <img
            src={`/images/esummit/team/team-${number}.${number === "01" || number === "09" ? "png" : "jpeg"}`}
            alt={`E-Summit 2026 team photograph ${number}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/65">E-Summit &apos;26 / {number}</span>
        </div>
      ))}
    </div>
  );
}
