"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { ArrowLeft, ArrowUpRight, Check, Copy, LogOut, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { firebaseAuth } from "@/lib/primus/firebase-client";

type Team = {
  code: string;
  teamName: string;
  track: "Product" | "Consulting" | "Finance";
  members: { name: string; email: string; role: string }[];
  status: "OPEN" | "SUBMITTED";
};

const hostels = ["Agira Hall","Amritam Hall","Prithvi Hall","Neeram Hall","Vyan Hall","Tejas Hall","Ambaram Hall","Viyat Hall","Anantam Hall","Vyom Hall","FRF/G","Vasudha Hall","Ira Hall","Ananta Hall","Dhriti Hall","Vahni Hall","Pavani Hall","Day Scholar"];
const tracks = ["Product", "Consulting", "Finance"] as const;
const inputClass = "mt-2 w-full border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#a3ff12]/70";
const labelClass = "block font-mono text-[10px] uppercase tracking-[0.16em] text-white/55";

export function PrimusRegistration() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [team, setTeam] = useState<Team | null>(null);
  const [createdTeamCode, setCreatedTeamCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState<(typeof tracks)[number]>("Product");
  const [teamCode, setTeamCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(firebaseAuth, (nextUser) => {
    setUser(nextUser);
    setEmailVerified(Boolean(nextUser?.emailVerified));
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!user || !emailVerified) { setTeam(null); return; }
    void loadTeam(user);
  }, [user, emailVerified]);

  async function loadTeam(currentUser: User) {
    try {
      const token = await currentUser.getIdToken(true);
      const response = await fetch("/api/primus/teams", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load your team.");
      setTeam(data.team || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your team.");
    }
  }

  async function refreshVerificationStatus() {
    if (!user) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await user.reload();
      const refreshedUser = firebaseAuth.currentUser;
      const verified = Boolean(refreshedUser?.emailVerified);
      setEmailVerified(verified);
      if (verified && refreshedUser) {
        await refreshedUser.getIdToken(true);
        setNotice("Email verified. Your registration dashboard is ready.");
        await loadTeam(refreshedUser);
      } else {
        setNotice("We have not detected the verification yet. Open the latest email link, then try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh verification status.");
    } finally { setBusy(false); }
  }
  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const domain = (process.env.NEXT_PUBLIC_THAPAR_EMAIL_DOMAIN || "thapar.edu").trim().toLowerCase();
      if (!email.trim().toLowerCase().endsWith(`@${domain}`)) throw new Error(`Use your official @${domain} email address.`);
      if (authMode === "signup") {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await sendEmailVerification(credential.user);
        setNotice("Verification email sent. Open the link in your inbox, then return here and sign in.");
        await signOut(firebaseAuth);
      } else {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await credential.user.reload();
        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
          await signOut(firebaseAuth);
          throw new Error("Your email is not verified yet. We sent another verification link.");
        }
        await credential.user.getIdToken(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally { setBusy(false); }
  }

  async function request(path: string, body?: Record<string, string>) {
    if (!user) throw new Error("Please sign in first.");
    const token = await user.getIdToken(true);
    const response = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
  }

  async function handleTeamAction(event: FormEvent<HTMLFormElement>, action: "create" | "join") {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const payload: Record<string, string> = action === "create"
        ? { teamName, track, name, phone, hostel }
        : { teamCode, name, phone, hostel };
      const data = await request(action === "create" ? "/api/primus/teams" : "/api/primus/teams/join", payload);
      if (action === "create" && typeof data.teamCode === "string") {
        setCreatedTeamCode(data.teamCode);
        setNotice("Your team has been created. Save this code and share it with your teammates.");
      } else {
        setNotice("You have joined the team.");
      }
      await loadTeam(user!);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to complete registration."); }
    finally { setBusy(false); }
  }

  async function submitTeam() {
    if (!team || !user) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await request(`/api/primus/teams/${team.code}/submit`, {});
      setNotice("Your team registration has been submitted.");
      await loadTeam(user);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to submit your team."); }
    finally { setBusy(false); }
  }

  const profileFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>Full name<input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Your name" /></label>
      <label className={labelClass}>Phone number<input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" placeholder="10-digit mobile number" /></label>
      <label className={`${labelClass} sm:col-span-2`}>Hall name<select className={inputClass} value={hostel} onChange={(e) => setHostel(e.target.value)} required><option value="" className="bg-[#071009]">Select your hall</option>{hostels.map((hall) => <option key={hall} value={hall} className="bg-[#071009]">{hall}</option>)}</select></label>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020503] px-5 pb-20 pt-28 text-[#efffed] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/events/tvc-x-sat" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50 transition hover:text-[#a3ff12]"><ArrowLeft className="h-3.5 w-3.5" /> Back to PRIMUS</Link>
        <div className="mt-12 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a3ff12]">PRIMUS’26 / Team registration</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">Make your<br /><span className="text-white/35">move.</span></h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/55">For current TIET students with a verified @thapar.edu email address. Teams can have 2–4 members. Participants from outside TIET should register through Saturnalia.</p>
        </div>

        {createdTeamCode && !team && (
          <div className="mt-8 border border-[#a3ff12]/35 bg-[#a3ff12]/[0.06] p-5 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a3ff12]">Team created · Save this code</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <strong className="text-2xl tracking-[0.12em] text-white sm:text-3xl">{createdTeamCode}</strong>
              <button type="button" onClick={() => void navigator.clipboard.writeText(createdTeamCode).then(() => setNotice("Team code copied."))} className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-white/75 hover:border-[#a3ff12]/60 hover:text-[#a3ff12]"><Copy className="h-4 w-4" /> Copy code</button>
            </div>
            <p className="mt-3 text-xs text-white/45">Share this code with your teammates so they can join your team.</p>
          </div>
        )}
        {(error || notice) && <div role="status" className={`mt-8 border px-4 py-3 text-sm ${error ? "border-red-400/30 bg-red-400/5 text-red-200" : "border-[#a3ff12]/30 bg-[#a3ff12]/5 text-[#dfffbe]"}`}>{error || notice}</div>}

        {!authReady ? <p className="mt-12 text-sm text-white/50">Loading secure registration…</p> : !user ? (
          <section className="mt-12 grid gap-10 border-t border-white/10 pt-8 lg:grid-cols-[.8fr_1.2fr]">
            <div><ShieldCheck className="h-7 w-7 text-[#a3ff12]" /><h2 className="mt-5 text-2xl font-semibold">Verify your identity.</h2><p className="mt-3 text-sm leading-relaxed text-white/50">Create an account with your Thapar email, verify it from your inbox, and sign in to manage your team.</p></div>
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="flex gap-6 border-b border-white/10 pb-4 font-mono text-[10px] uppercase tracking-[0.16em]"><button type="button" onClick={() => setAuthMode("signup")} className={authMode === "signup" ? "text-[#a3ff12]" : "text-white/40"}>Create account</button><button type="button" onClick={() => setAuthMode("login")} className={authMode === "login" ? "text-[#a3ff12]" : "text-white/40"}>Sign in</button></div>
              <label className={labelClass}>Thapar email<input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@thapar.edu" /></label>
              <label className={labelClass}>Password<input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" /></label>
              <button disabled={busy} className="inline-flex items-center gap-3 bg-[#a3ff12] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#c2ff70] disabled:opacity-50">{busy ? "Please wait…" : authMode === "signup" ? "Create account" : "Sign in"} <ArrowUpRight className="h-4 w-4" /></button>
            </form>
          </section>
        ) : !emailVerified ? (
          <section className="mt-12 border border-[#a3ff12]/20 p-7">
            <h2 className="text-2xl font-semibold">Verify your email</h2>
            <p className="mt-3 text-sm text-white/55">We sent a verification link to {user.email}. Once you have clicked it, return here and refresh your verification status.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => void refreshVerificationStatus()} className="bg-[#a3ff12] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-black disabled:opacity-50">{busy ? "Checking…" : "I have verified — continue"}</button>
              <button type="button" disabled={busy} onClick={() => void sendEmailVerification(user).then(() => setNotice("Verification email sent again.")).catch((err) => setError(err instanceof Error ? err.message : "Unable to resend verification email."))} className="border border-white/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest disabled:opacity-50">Resend verification</button>
              <button type="button" disabled={busy} onClick={() => void signOut(firebaseAuth)} className="border border-white/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest disabled:opacity-50">Sign out</button>
            </div>
          </section>
        ) : (
          <section className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-white/50">Signed in as</p><p className="mt-1 text-white">{user.email}</p></div><button onClick={() => void signOut(firebaseAuth)} className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45 hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button></div>
            {team ? (
              <div className="mt-10 border border-[#a3ff12]/25 bg-[#071009] p-6 sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-widest text-[#a3ff12]">Your team / {team.track}</p><h2 className="mt-3 text-3xl font-semibold">{team.teamName}</h2></div><span className="border border-white/15 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-white/60">{team.status}</span></div>
                <div className="mt-7 flex flex-wrap items-center gap-3"><span className="font-mono text-xs tracking-widest text-white/50">TEAM CODE</span><strong className="text-xl tracking-widest text-[#a3ff12]">{team.code}</strong><button aria-label="Copy team code" onClick={() => void navigator.clipboard.writeText(team.code).then(() => setNotice("Team code copied."))} className="text-white/50 hover:text-white"><Copy className="h-4 w-4" /></button></div>
                <div className="mt-8 space-y-3">{team.members.map((member) => <div key={member.email} className="flex items-center justify-between border-t border-white/10 py-3 text-sm"><span>{member.name}<span className="ml-2 text-xs text-white/35">{member.role}</span></span><span className="text-xs text-white/40">{member.email}</span></div>)}</div>
                <p className="mt-5 text-xs text-white/45">{team.members.length}/4 members · Minimum 2 members required to submit.</p>
                {team.status === "OPEN" && <button onClick={() => void submitTeam()} disabled={busy || team.members.length < 2} className="mt-7 bg-[#a3ff12] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-35">{busy ? "Submitting…" : "Submit team registration"}</button>}
                {team.status === "SUBMITTED" && <p className="mt-7 inline-flex items-center gap-2 text-sm text-[#a3ff12]"><Check className="h-4 w-4" /> Registration submitted</p>}
              </div>
            ) : (
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <form onSubmit={(e) => void handleTeamAction(e, "create")} className="space-y-5 border border-white/10 p-6 sm:p-8">
                  <div><p className="font-mono text-[10px] uppercase tracking-widest text-[#a3ff12]">Option 01</p><h2 className="mt-3 text-2xl font-semibold">Create a team</h2><p className="mt-2 text-sm text-white/45">You become the team leader and receive a join code.</p></div>
                  <label className={labelClass}>Team name<input className={inputClass} value={teamName} onChange={(e) => setTeamName(e.target.value)} required minLength={2} maxLength={60} placeholder="Your team name" /></label>
                  <label className={labelClass}>Track<select className={inputClass} value={track} onChange={(e) => setTrack(e.target.value as (typeof tracks)[number])}>{tracks.map((item) => <option key={item} className="bg-[#071009]">{item}</option>)}</select></label>
                  {profileFields}
                  <button disabled={busy} className="bg-[#a3ff12] px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-black disabled:opacity-50">{busy ? "Creating…" : "Create team"}</button>
                </form>
                <form onSubmit={(e) => void handleTeamAction(e, "join")} className="space-y-5 border border-white/10 p-6 sm:p-8">
                  <div><p className="font-mono text-[10px] uppercase tracking-widest text-[#a3ff12]">Option 02</p><h2 className="mt-3 text-2xl font-semibold">Join a team</h2><p className="mt-2 text-sm text-white/45">Enter the code shared by your team leader.</p></div>
                  <label className={labelClass}>Team code<input className={inputClass} value={teamCode} onChange={(e) => setTeamCode(e.target.value.toUpperCase())} required placeholder="PRM-XXXXXXXX" /></label>
                  {profileFields}
                  <button disabled={busy} className="border border-[#a3ff12]/50 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[#a3ff12] disabled:opacity-50"><Users className="mr-2 inline h-4 w-4" /> {busy ? "Joining…" : "Join team"}</button>
                </form>
              </div>
            )}
          </section>
        )}
        <p className="mt-16 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/35">By registering, you confirm that the information provided is accurate and consent to its use for PRIMUS’26 team coordination. For participants outside TIET, use the <a className="text-[#a3ff12] underline underline-offset-4" href="https://www.saturnalia.in/events/business" target="_blank" rel="noreferrer">Saturnalia registration page</a>.</p>
      </div>
    </main>
  );
}
