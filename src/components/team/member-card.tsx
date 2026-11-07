"use client";

import Image from "next/image";
import { TeamMember } from "@/data/team";
import { Linkedin, User, ArrowUpRight } from "lucide-react";

interface MemberCardProps {
  member: TeamMember;
  isProminent?: boolean;
  index?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MemberCard({ member, isProminent = false, index = 0 }: MemberCardProps) {
  const initials = getInitials(member.name);
  const hasLinkedIn = Boolean(member.linkedin?.trim());

  return (
    <article className="tvc-member-card group relative min-w-0" style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}>
      <div className={`tvc-member-frame relative isolate overflow-hidden bg-[#151513] ${isProminent ? "aspect-[4/4.35]" : "aspect-[4/4.8]"}`}>
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes={isProminent ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            className="tvc-member-photo object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_35%,rgba(245,237,0,0.08),transparent_48%)] text-white/35">
            <User className="h-12 w-12 stroke-[1]" />
            <span className="font-mono text-xs tracking-[0.2em]">{initials}</span>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 font-mono text-[10px] tabular-nums tracking-[0.16em] text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,.8)]">{String(index + 1).padStart(2, "0")}</span>
        {hasLinkedIn && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn profile of ${member.name}`} className="absolute right-4 top-4 z-10 flex h-9 w-9 translate-y-1 items-center justify-center border border-white/35 bg-black/35 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-[#f5ed00] hover:bg-[#f5ed00] hover:text-black group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100">
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#f5ed00] transition-all duration-500 group-hover:w-full" />
      </div>

      <div className="relative flex items-start justify-between gap-3 border-b border-white/15 pb-4 pt-4 transition-colors duration-300 group-hover:border-[#f5ed00]/55">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#f5ed00]">{member.position}</p>
          <h3 className={`font-medium leading-tight tracking-[-0.04em] text-[#f4f3ef] transition-colors group-hover:text-white ${isProminent ? "text-2xl sm:text-3xl" : "text-xl"}`}>{member.name}</h3>
        </div>
        {hasLinkedIn && <span className="mt-5 shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#f5ed00]"><ArrowUpRight className="h-4 w-4" /></span>}
      </div>
    </article>
  );
}
