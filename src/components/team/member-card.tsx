"use client";

import Image from "next/image";
import { TeamMember } from "@/data/team";
import { Linkedin, ArrowUpRight, User } from "lucide-react";

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
    <article
      className={`tvc-member-card group relative isolate overflow-hidden border border-white/10 bg-[#11110f] ${isProminent ? "md:col-span-1" : ""}`}
      style={{ animationDelay: `${Math.min(index, 12) * 65}ms` }}
    >
      <div className={`relative overflow-hidden bg-[#171715] ${isProminent ? "aspect-[4/4.5]" : "aspect-[4/4.8]"}`}>
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes={isProminent ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            className="tvc-member-photo object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_35%,rgba(245,237,0,0.09),transparent_45%)] text-white/30">
            <User className="h-14 w-14 stroke-[1]" />
            <span className="font-mono text-xs tracking-[0.2em]">{initials}</span>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/10 opacity-85 transition-opacity duration-500 group-hover:opacity-100" />
        <div aria-hidden="true" className="absolute inset-4 border border-white/0 transition-all duration-500 group-hover:inset-5 group-hover:border-[#f5ed00]/45" />
        <span className="absolute left-5 top-5 font-mono text-[10px] tracking-[0.18em] text-white/65">{String(index + 1).padStart(2, "0")}</span>
        {hasLinkedIn && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LinkedIn profile of ${member.name}`}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center border border-white/25 bg-black/35 text-white backdrop-blur-sm transition-all duration-300 hover:border-[#f5ed00] hover:bg-[#f5ed00] hover:text-black"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#f5ed00]">{member.position}</p>
          <h3 className={`font-semibold leading-[0.95] tracking-[-0.055em] text-white ${isProminent ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{member.name}</h3>
          <div className="mt-4 flex items-center justify-between border-t border-white/25 pt-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">TVC · 2026—27</span>
            <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/65 transition-colors group-hover:text-[#f5ed00]">
              Connect <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
