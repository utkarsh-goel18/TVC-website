import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import {
  mutateDb,
  readDb,
  hasPermission,
  createNotification,
  recordAuditLog,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_FIXTURE_ACCESS_CODE,
} from "@/lib/exclusive/db";
import { generateSecureToken, hashPassword } from "@/lib/exclusive/crypto";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member } = auth;
  const canApproveL2 = hasPermission(db, member, "approve_level_2_applications");
  const canApproveL1 =
    hasPermission(db, member, "approve_level_1_applications") || canApproveL2;

  if (!canApproveL1 && !canApproveL2) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "You do not have permission to review membership applications.",
      },
      { status: 403 }
    );
  }

  const applications = db.membership_applications
    .filter((app) => {
      if (app.requested_level === 2) return canApproveL2;
      if (app.requested_level === 1) return canApproveL1;
      return false;
    })
    .map((app) => {
      const reviewer = app.reviewed_by
        ? db.members.find((m) => m.id === app.reviewed_by)
        : null;
      return {
        ...app,
        reviewer_name: reviewer?.name,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

  return NextResponse.json({
    applications,
    canApproveL2,
    canApproveL1,
  });
}

// Public / Candidate Application Submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = String(body.full_name || "").trim();
    const rollNumber = String(body.roll_number || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const academicYear = String(body.academic_year || "").trim();
    const requestedLevel = Number(body.requested_level) === 2 ? 2 : 1;
    const departmentInterests = Array.isArray(body.department_interests)
      ? body.department_interests.map((d: unknown) => String(d).trim()).filter(Boolean)
      : [];
    const skills = Array.isArray(body.skills)
      ? body.skills.map((s: unknown) => String(s).trim()).filter(Boolean)
      : [];
    const previousExperience = String(body.previous_experience || "").trim();
    const motivation = String(body.motivation || "").trim();
    const additionalInfo = String(body.additional_info || "").trim();

    if (!fullName || !rollNumber || !email || !phone || !motivation) {
      return NextResponse.json(
        {
          error: "MISSING_FIELDS",
          message: "Full name, roll number, university email, phone, and motivation are required.",
        },
        { status: 400 }
      );
    }

    const db = readDb();

    // Prevent duplicate member or pending/accepted application
    const existingMember = db.members.find(
      (m) =>
        m.roll_number.toLowerCase() === rollNumber.toLowerCase() ||
        m.email.toLowerCase() === email
    );
    if (existingMember) {
      return NextResponse.json(
        {
          error: "ALREADY_MEMBER",
          message: "A TVC member account with this roll number or email already exists.",
        },
        { status: 409 }
      );
    }

    const duplicateApp = db.membership_applications.find(
      (a) =>
        (a.roll_number.toLowerCase() === rollNumber.toLowerCase() ||
          a.email.toLowerCase() === email) &&
        (a.status === "pending" || a.status === "accepted")
    );
    if (duplicateApp) {
      return NextResponse.json(
        {
          error: "DUPLICATE_APPLICATION",
          message: `An application for roll number ${rollNumber} is already ${duplicateApp.status}.`,
        },
        { status: 409 }
      );
    }

    const created = mutateDb((d) => {
      const newApp = {
        id: `app-l${requestedLevel}-${generateSecureToken(6)}`,
        full_name: fullName,
        roll_number: rollNumber,
        email,
        phone,
        academic_year: academicYear || (requestedLevel === 2 ? "2nd Year" : "1st Year"),
        requested_level: requestedLevel as 1 | 2,
        department_interests: departmentInterests,
        skills,
        previous_experience: previousExperience,
        motivation,
        additional_info: additionalInfo,
        status: "pending" as const,
        submitted_at: new Date().toISOString(),
      };
      d.membership_applications.unshift(newApp);
      return newApp;
    });

    return NextResponse.json({
      success: true,
      application: created,
      message: `Level ${requestedLevel} membership application submitted successfully. Status: Pending review.`,
    });
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Unable to submit application." },
      { status: 500 }
    );
  }
}

// Review & Accept / Reject Application (Server-side permission + concurrency protection)
export async function PATCH(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const applicationId = String(body.applicationId || "");
  const decision = body.decision === "accepted" ? "accepted" : body.decision === "rejected" ? "rejected" : null;
  const comments = String(body.comments || "").trim();
  const rejectionReason = String(body.rejectionReason || "").trim();

  if (!applicationId || !decision) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "applicationId and decision ('accepted' | 'rejected') are required." },
      { status: 400 }
    );
  }

  const outcome = mutateDb((db) => {
    const app = db.membership_applications.find((a) => a.id === applicationId);
    if (!app) {
      return { status: 404, payload: { error: "NOT_FOUND", message: "Application not found." } };
    }

    // Prevent simultaneous approval attempts or conflicting decisions
    if (app.status !== "pending") {
      return {
        status: 409,
        payload: {
          error: "ALREADY_DECIDED",
          message: `This application has already been ${app.status}.`,
        },
      };
    }

    // Enforce Level 3 for Level 2 applications, and Level 2/3 for Level 1 applications
    if (app.requested_level === 2) {
      if (!hasPermission(db, auth.member, "approve_level_2_applications")) {
        return {
          status: 403,
          payload: {
            error: "FORBIDDEN",
            message: "Only authorised Level 3 leadership can review Level 2 applications.",
          },
        };
      }
    } else if (app.requested_level === 1) {
      if (
        !hasPermission(db, auth.member, "approve_level_1_applications") &&
        !hasPermission(db, auth.member, "approve_level_2_applications")
      ) {
        return {
          status: 403,
          payload: {
            error: "FORBIDDEN",
            message: "You are not authorised to review Level 1 applications.",
          },
        };
      }
    }

    const now = new Date().toISOString();
    app.status = decision;
    app.reviewed_at = now;
    app.reviewed_by = auth.member.id;
    app.review_comments = comments;
    if (decision === "rejected") {
      app.rejection_reason = rejectionReason || comments || "Application not selected in current cycle.";
    }

    db.application_reviews.push({
      id: `rev-${generateSecureToken(6)}`,
      application_id: app.id,
      reviewer_id: auth.member.id,
      decision,
      comments,
      rejection_reason: app.rejection_reason,
      created_at: now,
    });

    if (decision === "accepted") {
      // Ensure no duplicate member account is created
      let provisionedMember = db.members.find(
        (m) => m.roll_number.toLowerCase() === app.roll_number.toLowerCase()
      );

      if (!provisionedMember) {
        const positionId =
          app.requested_level === 2 ? "pos-l2-general" : "pos-l1-general";
        const usernameSlug = app.full_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        provisionedMember = {
          id: `member-${usernameSlug}-${app.roll_number.slice(-3)}`,
          name: app.full_name,
          roll_number: app.roll_number,
          username: app.roll_number,
          email: app.email,
          phone: app.phone,
          level: app.requested_level,
          academic_year: app.academic_year,
          position_id: positionId,
          membership_status: "active",
          bio: `${app.academic_year} General Member at Thapar Venture Club. ${app.motivation}`,
          skills: app.skills,
          interests: app.department_interests,
          password_hash: hashPassword(DEFAULT_FIXTURE_ACCESS_CODE),
          must_change_password: true,
          notification_preferences: { ...DEFAULT_NOTIFICATION_PREFS },
          joined_at: now,
          created_at: now,
          updated_at: now,
        };
        db.members.push(provisionedMember);

        // Assign matching departments from their interests
        for (const deptName of app.department_interests) {
          const matchedDept = db.departments.find(
            (d) => d.name.toLowerCase() === deptName.toLowerCase() || d.id === deptName
          );
          if (matchedDept) {
            db.member_departments.push({
              member_id: provisionedMember.id,
              department_id: matchedDept.id,
              assigned_by: auth.member.id,
              assigned_at: now,
            });
          }
        }
      } else {
        provisionedMember.membership_status = "active";
        provisionedMember.level = app.requested_level;
        provisionedMember.position_id =
          app.requested_level === 2 ? "pos-l2-general" : "pos-l1-general";
      }

      app.provisioned_member_id = provisionedMember.id;
      app.initial_password_hint = DEFAULT_FIXTURE_ACCESS_CODE;

      createNotification(db, {
        recipient_id: provisionedMember.id,
        type: "application_accepted",
        title: `Welcome to TVC Level ${app.requested_level}!`,
        body: `Your TVC Level ${app.requested_level} membership application was approved by ${auth.member.name}. You now have access to Level ${app.requested_level} Community and your departments.`,
        reference_type: "application",
        reference_id: app.id,
        deep_link: "/members?module=dashboard",
      });

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: `LEVEL_${app.requested_level}_APPLICATION_ACCEPTED`,
        target_type: "application",
        target_id: app.id,
        summary: `${auth.member.name} approved Level ${app.requested_level} application for ${app.full_name} (${app.roll_number}). Account provisioned as General Member.`,
        metadata: {
          application_id: app.id,
          provisioned_member_id: provisionedMember.id,
          level: app.requested_level,
        },
      });
    } else {
      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: `LEVEL_${app.requested_level}_APPLICATION_REJECTED`,
        target_type: "application",
        target_id: app.id,
        summary: `${auth.member.name} rejected Level ${app.requested_level} application for ${app.full_name} (${app.roll_number}).`,
        metadata: { reason: app.rejection_reason },
      });
    }

    return {
      status: 200,
      payload: {
        success: true,
        application: app,
        message:
          decision === "accepted"
            ? `Application approved! ${app.full_name} (${app.roll_number}) is now an Active Level ${app.requested_level} General Member.`
            : `Application for ${app.full_name} marked as rejected.`,
      },
    };
  });

  return NextResponse.json(outcome.payload, { status: outcome.status });
}

