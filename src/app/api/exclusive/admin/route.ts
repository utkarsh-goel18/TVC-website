import { NextRequest, NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/exclusive/auth";
import {
  mutateDb,
  hasPermission,
  toPublicMemberView,
  createNotification,
  recordAuditLog,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_FIXTURE_ACCESS_CODE,
} from "@/lib/exclusive/db";
import { generateSecureToken, hashPassword } from "@/lib/exclusive/crypto";
import { MembershipStatus, OrganisationalLevel } from "@/lib/exclusive/types";

export async function GET(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const { db, member } = auth;
  const canPromoteCore = hasPermission(db, member, "promote_core_members");
  const canManagePositions = hasPermission(db, member, "manage_positions");
  const canManageMembers = hasPermission(db, member, "manage_members");
  const canManagePerms = hasPermission(db, member, "manage_permissions");
  const canViewAudit = hasPermission(db, member, "view_audit_logs");

  if (
    !canPromoteCore &&
    !canManagePositions &&
    !canManageMembers &&
    !canManagePerms &&
    !canViewAudit
  ) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "You do not have administrative permissions.",
      },
      { status: 403 }
    );
  }

  const allMembers = db.members.map((m) => toPublicMemberView(db, m));
  const positionsWithPerms = db.positions.map((pos) => {
    const permIds = db.position_permissions
      .filter((pp) => pp.position_id === pos.id)
      .map((pp) => pp.permission_id);
    const permKeys = db.permissions
      .filter((p) => permIds.includes(p.id))
      .map((p) => p.key);
    return {
      ...pos,
      permission_ids: permIds,
      permission_keys: permKeys,
    };
  });

  const positionHistory = db.member_position_history
    .map((h) => {
      const m = db.members.find((mem) => mem.id === h.member_id);
      const actor = db.members.find((mem) => mem.id === h.changed_by);
      const prevPos = db.positions.find((p) => p.id === h.previous_position_id);
      const nextPos = db.positions.find((p) => p.id === h.new_position_id);
      return {
        ...h,
        member_name: m?.name || "Member",
        member_roll: m?.roll_number || "",
        changed_by_name: actor?.name || "Executive",
        previous_position_name: prevPos?.name || h.previous_position_id,
        new_position_name: nextPos?.name || h.new_position_id,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );

  const auditLogs = canViewAudit
    ? db.audit_logs.slice(0, 80).map((log) => {
        const actor = db.members.find((m) => m.id === log.actor_id);
        return {
          ...log,
          actor_name: actor?.name || "System",
          actor_roll: actor?.roll_number || "",
        };
      })
    : [];

  return NextResponse.json({
    members: allMembers,
    positions: positionsWithPerms,
    permissions: db.permissions,
    positionHistory,
    auditLogs,
  });
}

export async function POST(req: NextRequest) {
  const auth = requireActiveMember(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const action = String(body.action || "");

  const outcome = mutateDb((db) => {
    const now = new Date().toISOString();

    // 1. PROMOTE LEVEL 2 GENERAL MEMBER TO CORE (OR REVOKE CORE)
    if (action === "promote_core" || action === "revoke_core") {
      if (!hasPermission(db, auth.member, "promote_core_members")) {
        return {
          status: 403,
          payload: {
            error: "FORBIDDEN",
            message: "Requires 'promote_core_members' permission.",
          },
        };
      }

      const targetMemberId = String(body.memberId || "");
      const reason = String(body.reason || "").trim();
      const target = db.members.find((m) => m.id === targetMemberId);

      if (!target) {
        return {
          status: 404,
          payload: { error: "NOT_FOUND", message: "Member not found." },
        };
      }

      // Critical Rule: Core promotion is strictly for Level 2 members and NEVER changes their organisational level!
      if (target.level !== 2) {
        return {
          status: 400,
          payload: {
            error: "INVALID_LEVEL",
            message: "Core designation applies strictly to Level 2 (Second-Year) members.",
          },
        };
      }

      const prevPositionId = target.position_id;
      const nextPositionId =
        action === "promote_core" ? "pos-l2-core" : "pos-l2-general";

      if (prevPositionId === nextPositionId) {
        return {
          status: 400,
          payload: {
            error: "ALREADY_SET",
            message:
              action === "promote_core"
                ? `${target.name} is already a Level 2 Core Member.`
                : `${target.name} is already a Level 2 General Member.`,
          },
        };
      }

      // Keep target.level strictly equal to 2!
      target.position_id = nextPositionId;
      target.level = 2;
      target.updated_at = now;

      db.member_position_history.unshift({
        id: `mph-${generateSecureToken(6)}`,
        member_id: target.id,
        previous_position_id: prevPositionId,
        new_position_id: nextPositionId,
        previous_level: 2,
        new_level: 2,
        reason:
          reason ||
          (action === "promote_core"
            ? "Promoted to Level 2 Core Member"
            : "Core designation revoked to Level 2 General Member"),
        changed_by: auth.member.id,
        changed_at: now,
      });

      createNotification(db, {
        recipient_id: target.id,
        type: "core_promotion",
        title:
          action === "promote_core"
            ? "Congratulations! Promoted to TVC Core"
            : "Position Updated: Level 2 General Member",
        body:
          action === "promote_core"
            ? `${auth.member.name} promoted you to Level 2 Core Member. Your organisational level remains Level 2.`
            : `${auth.member.name} updated your designation to Level 2 General Member.`,
        reference_type: "member",
        reference_id: target.id,
        deep_link: "/members?module=profile",
      });

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: action === "promote_core" ? "CORE_PROMOTION" : "CORE_REVOCATION",
        target_type: "member",
        target_id: target.id,
        summary:
          action === "promote_core"
            ? `${auth.member.name} promoted ${target.name} (${target.roll_number}) to Level 2 Core Member (level unchanged: 2).`
            : `${auth.member.name} revoked Core designation for ${target.name} (${target.roll_number}) back to Level 2 General Member.`,
        metadata: {
          previous_position: prevPositionId,
          new_position: nextPositionId,
          level: 2,
          reason,
        },
      });

      return {
        status: 200,
        payload: {
          success: true,
          member: toPublicMemberView(db, target),
          message:
            action === "promote_core"
              ? `${target.name} has been promoted to Level 2 Core Member!`
              : `${target.name}'s designation updated to Level 2 General Member.`,
        },
      };
    }

    // 2. ADD NEW POSITION (e.g., Innovation Secretary, Joint Tech Secretary) WITHOUT CODE REWRITES
    if (action === "create_position") {
      if (!hasPermission(db, auth.member, "manage_positions")) {
        return {
          status: 403,
          payload: { error: "FORBIDDEN", message: "Requires 'manage_positions' permission." },
        };
      }

      const name = String(body.name || "").trim();
      const description = String(body.description || "").trim();
      const orgLevel: OrganisationalLevel = [1, 2, 3].includes(
        Number(body.organisational_level)
      )
        ? (Number(body.organisational_level) as OrganisationalLevel)
        : 3;

      if (!name) {
        return {
          status: 400,
          payload: { error: "MISSING_NAME", message: "Position name is required." },
        };
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      if (db.positions.some((p) => p.slug === slug)) {
        return {
          status: 409,
          payload: { error: "DUPLICATE_POSITION", message: `Position '${name}' already exists.` },
        };
      }

      const posId = `pos-${slug}-${generateSecureToken(3)}`;
      const newPosition = {
        id: posId,
        name,
        slug,
        organisational_level: orgLevel,
        description:
          description || `Level ${orgLevel} official position (${name})`,
        is_active: true,
        created_at: now,
      };
      db.positions.push(newPosition);

      // Explicitly assign configured permissions (or default common permissions for that level if requested)
      const requestedPermKeys: string[] = Array.isArray(body.permission_keys)
        ? body.permission_keys.map(String)
        : orgLevel === 3
        ? db.permissions.map((p) => p.key)
        : orgLevel === 2
        ? [
            "approve_level_1_applications",
            "create_level_2_tasks",
            "create_level_1_tasks",
          ]
        : [];

      for (const pKey of requestedPermKeys) {
        const perm = db.permissions.find((p) => p.key === pKey);
        if (perm) {
          db.position_permissions.push({
            position_id: posId,
            permission_id: perm.id,
          });
        }
      }

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: "POSITION_CREATED",
        target_type: "position",
        target_id: posId,
        summary: `${auth.member.name} created Level ${orgLevel} position '${name}' with ${requestedPermKeys.length} explicit permissions.`,
        metadata: { slug, level: orgLevel, permissions: requestedPermKeys },
      });

      return {
        status: 200,
        payload: {
          success: true,
          position: newPosition,
          message: `Position '${name}' (Level ${orgLevel}) created and configured.`,
        },
      };
    }

    // 3. TOGGLE POSITION ACTIVE STATUS OR UPDATE POSITION PERMISSIONS
    if (action === "toggle_position" || action === "update_position_permissions") {
      if (
        !hasPermission(db, auth.member, "manage_positions") &&
        !hasPermission(db, auth.member, "manage_permissions")
      ) {
        return {
          status: 403,
          payload: { error: "FORBIDDEN", message: "Insufficient permissions." },
        };
      }

      const positionId = String(body.positionId || "");
      const pos = db.positions.find((p) => p.id === positionId);
      if (!pos) {
        return {
          status: 404,
          payload: { error: "NOT_FOUND", message: "Position not found." },
        };
      }

      if (action === "toggle_position") {
        pos.is_active = !pos.is_active;
        recordAuditLog(db, {
          actor_id: auth.member.id,
          action: pos.is_active ? "POSITION_ACTIVATED" : "POSITION_DEACTIVATED",
          target_type: "position",
          target_id: pos.id,
          summary: `${auth.member.name} ${pos.is_active ? "activated" : "deactivated"} position '${pos.name}'.`,
        });
        return {
          status: 200,
          payload: {
            success: true,
            message: `Position '${pos.name}' is now ${pos.is_active ? "active" : "inactive"}.`,
          },
        };
      }

      if (action === "update_position_permissions") {
        const permKeys: string[] = Array.isArray(body.permissionKeys)
          ? body.permissionKeys.map(String)
          : [];

        db.position_permissions = db.position_permissions.filter(
          (pp) => pp.position_id !== pos.id
        );

        for (const key of permKeys) {
          const perm = db.permissions.find((p) => p.key === key);
          if (perm) {
            db.position_permissions.push({
              position_id: pos.id,
              permission_id: perm.id,
            });
          }
        }

        recordAuditLog(db, {
          actor_id: auth.member.id,
          action: "POSITION_PERMISSIONS_UPDATED",
          target_type: "position",
          target_id: pos.id,
          summary: `${auth.member.name} updated explicit permissions for position '${pos.name}'.`,
          metadata: { permissionKeys: permKeys },
        });

        return {
          status: 200,
          payload: {
            success: true,
            message: `Updated permissions for '${pos.name}'.`,
          },
        };
      }
    }

    // 4. ACTIVATE / DEACTIVATE MEMBER ACCOUNT (Preserves historical messages & tasks!)
    if (action === "set_member_status") {
      if (!hasPermission(db, auth.member, "manage_members")) {
        return {
          status: 403,
          payload: { error: "FORBIDDEN", message: "Requires 'manage_members' permission." },
        };
      }

      const targetMemberId = String(body.memberId || "");
      const nextStatus: MembershipStatus = ["active", "inactive", "suspended"].includes(
        body.status
      )
        ? body.status
        : "inactive";

      if (targetMemberId === auth.member.id) {
        return {
          status: 400,
          payload: { error: "SELF_CHANGE", message: "You cannot deactivate your own active session." },
        };
      }

      const target = db.members.find((m) => m.id === targetMemberId);
      if (!target) {
        return {
          status: 404,
          payload: { error: "NOT_FOUND", message: "Member not found." },
        };
      }

      target.membership_status = nextStatus;
      target.updated_at = now;

      // Immediately revoke active sessions if deactivated or suspended
      if (nextStatus !== "active") {
        db.sessions = db.sessions.filter((s) => s.member_id !== target.id);
      }

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: `MEMBER_STATUS_${nextStatus.toUpperCase()}`,
        target_type: "member",
        target_id: target.id,
        summary: `${auth.member.name} set membership status of ${target.name} (${target.roll_number}) to '${nextStatus}'. Historical records preserved.`,
      });

      return {
        status: 200,
        payload: {
          success: true,
          member: toPublicMemberView(db, target),
          message: `${target.name}'s account status set to '${nextStatus}'.`,
        },
      };
    }

    // 5. ASSIGN POSITION TO MEMBER (WITHIN SAME LEVEL OR AUTHORISED)
    if (action === "assign_member_position") {
      if (!hasPermission(db, auth.member, "manage_members")) {
        return {
          status: 403,
          payload: { error: "FORBIDDEN", message: "Requires 'manage_members' permission." },
        };
      }

      const targetMemberId = String(body.memberId || "");
      const newPositionId = String(body.positionId || "");
      const target = db.members.find((m) => m.id === targetMemberId);
      const newPos = db.positions.find((p) => p.id === newPositionId && p.is_active);

      if (!target || !newPos) {
        return {
          status: 404,
          payload: { error: "NOT_FOUND", message: "Member or active position not found." },
        };
      }

      const prevPosId = target.position_id;
      const prevLevel = target.level;
      target.position_id = newPos.id;
      target.level = newPos.organisational_level;
      target.updated_at = now;

      db.member_position_history.unshift({
        id: `mph-${generateSecureToken(6)}`,
        member_id: target.id,
        previous_position_id: prevPosId,
        new_position_id: newPos.id,
        previous_level: prevLevel,
        new_level: target.level,
        reason: String(body.reason || `Assigned position: ${newPos.name}`),
        changed_by: auth.member.id,
        changed_at: now,
      });

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: "MEMBER_POSITION_ASSIGNED",
        target_type: "member",
        target_id: target.id,
        summary: `${auth.member.name} assigned position '${newPos.name}' (Level ${newPos.organisational_level}) to ${target.name}.`,
      });

      return {
        status: 200,
        payload: {
          success: true,
          member: toPublicMemberView(db, target),
          message: `Assigned '${newPos.name}' to ${target.name}.`,
        },
      };
    }

    // 6. PROVISION NEW MEMBER ACCOUNT
    if (action === "provision_member") {
      if (!hasPermission(db, auth.member, "manage_members")) {
        return {
          status: 403,
          payload: { error: "FORBIDDEN", message: "Requires 'manage_members' permission." },
        };
      }

      const name = String(body.name || "").trim();
      const rollNumber = String(body.roll_number || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const positionId = String(body.position_id || "pos-l1-general");
      const pos = db.positions.find((p) => p.id === positionId) || db.positions[db.positions.length - 1];

      if (!name || !rollNumber || !email) {
        return {
          status: 400,
          payload: { error: "MISSING_FIELDS", message: "Name, roll number, and email are required." },
        };
      }

      if (
        db.members.some(
          (m) =>
            m.roll_number.toLowerCase() === rollNumber.toLowerCase() ||
            m.email.toLowerCase() === email
        )
      ) {
        return {
          status: 409,
          payload: { error: "DUPLICATE_MEMBER", message: "Member with this roll number or email already exists." },
        };
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const newMember = {
        id: `member-${slug}-${rollNumber.slice(-3)}`,
        name,
        roll_number: rollNumber,
        username: rollNumber,
        email,
        phone: String(body.phone || ""),
        level: pos.organisational_level,
        academic_year:
          pos.organisational_level === 3
            ? "4th Year"
            : pos.organisational_level === 2
            ? "2nd Year"
            : "1st Year",
        position_id: pos.id,
        membership_status: "active" as const,
        bio: `${pos.name} at Thapar Venture Club.`,
        skills: [],
        interests: [],
        password_hash: hashPassword(DEFAULT_FIXTURE_ACCESS_CODE),
        must_change_password: true,
        notification_preferences: { ...DEFAULT_NOTIFICATION_PREFS },
        joined_at: now,
        created_at: now,
        updated_at: now,
      };

      db.members.push(newMember);

      recordAuditLog(db, {
        actor_id: auth.member.id,
        action: "MEMBER_PROVISIONED",
        target_type: "member",
        target_id: newMember.id,
        summary: `${auth.member.name} provisioned Level ${newMember.level} member ${name} (${rollNumber}) as ${pos.name}.`,
      });

      return {
        status: 200,
        payload: {
          success: true,
          member: toPublicMemberView(db, newMember),
          initialAccessCode: DEFAULT_FIXTURE_ACCESS_CODE,
          message: `Provisioned ${name} (${rollNumber}) as Level ${newMember.level} ${pos.name}.`,
        },
      };
    }

    return {
      status: 400,
      payload: { error: "INVALID_ACTION", message: "Unsupported administrative action." },
    };
  });

  return NextResponse.json(outcome.payload, { status: outcome.status });
}

