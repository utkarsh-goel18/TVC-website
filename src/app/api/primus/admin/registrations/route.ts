import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/primus/firebase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const decoded = await getFirebaseAuth().verifyIdToken(token);
    const allowedAdmins = (process.env.PRIMUS_ADMIN_UIDS || "").split(",").map((uid) => uid.trim()).filter(Boolean);
    if (!allowedAdmins.includes(decoded.uid)) return NextResponse.json({ error: "FORBIDDEN", message: "You are not authorised to view registrations." }, { status: 403 });

    const snapshot = await getFirebaseFirestore().collection("primusTeams").orderBy("createdAt", "desc").get();
    const teams = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json({
      teams,
      summary: {
        totalTeams: teams.length,
        submittedTeams: teams.filter((team) => team.status === "SUBMITTED").length,
        openTeams: teams.filter((team) => team.status === "OPEN").length,
        totalParticipants: teams.reduce((count, team) => count + (Array.isArray(team.members) ? team.members.length : 0), 0),
        byTrack: Object.fromEntries(["Product", "Consulting", "Finance"].map((track) => [track, teams.filter((team) => team.track === track).length])),
      },
    });
  } catch {
    return NextResponse.json({ error: "REQUEST_FAILED", message: "Unable to load registrations." }, { status: 500 });
  }
}
