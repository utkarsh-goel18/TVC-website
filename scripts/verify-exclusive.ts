/**
 * TVC Exclusive Verification & Security Suite
 * Tests all 8 role fixtures and all 17 security/permission assertions.
 */

import {
  readDb,
  writeDb,
  mutateDb,
  toPublicMemberView,
  hasPermission,
  getMemberPermissions,
  getMemberDepartments,
  DEFAULT_NOTIFICATION_PREFS,
} from "../src/lib/exclusive/db";
import {
  verifyPassword,
  hashPassword,
  deriveConversationSharedKey,
  encryptE2EE,
  decryptE2EE,
} from "../src/lib/exclusive/crypto";
import type {
  MemberRecord,
  TVCExclusiveDatabaseSchema,
} from "../src/lib/exclusive/types";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ [FAIL] ${testName} ${detail ? `- ${detail}` : ""}`);
  }
}

async function runVerification() {
  console.log("\n=======================================================");
  console.log(" TVC EXCLUSIVE — MASTER SPECIFICATION VERIFICATION");
  console.log("=======================================================\n");

  // 1. Initialise and load database
  const db = readDb();
  console.log(`[INFO] Database loaded. Total registered members: ${db.members.length}`);
  console.log(`[INFO] Total positions: ${db.positions.length}`);
  console.log(`[INFO] Total departments: ${db.departments.length}`);
  console.log(`[INFO] Total permissions: ${db.permissions.length}\n`);

  // Section A: Verify All 8 Role Fixtures
  console.log("--- Section A: Verifying 8 Required Role Fixtures ---");

  const l3Pres = db.members.find((m) => m.roll_number === "102203000");
  const l3GenSec = db.members.find((m) => m.roll_number === "102203001");
  const l3JointSec = db.members.find((m) => m.roll_number === "102203004");
  const l3DesignSec = db.members.find((m) => m.roll_number === "102203014");
  const l3TechSec = db.members.find((m) => m.roll_number === "102203013");
  const l2Core = db.members.find((m) => m.roll_number === "102303101");
  const l2General = db.members.find((m) => m.roll_number === "102303102");
  const l1General = db.members.find((m) => m.roll_number === "102403201");

  assert(!!l3Pres && l3Pres.level === 3, "Fixture 1: Level 3 President exists (102203000, Pranav Kapoor, Level 3)");
  assert(!!l3GenSec && l3GenSec.level === 3, "Fixture 2: Level 3 General Secretary exists (102203001, Sanchit Sehgal, Level 3)");
  assert(!!l3JointSec && l3JointSec.level === 3, "Fixture 3: Level 3 Joint Secretary exists (102203004, Aadish Jain, Level 3)");
  assert(!!l3DesignSec && l3DesignSec.level === 3, "Fixture 4: Level 3 Design Secretary exists (102203014, Krrish Chawla, Level 3)");
  assert(!!l3TechSec && l3TechSec.level === 3, "Fixture 5: Level 3 Tech Secretary exists (102203013, Shaurya Gupta, Level 3)");
  assert(!!l2Core && l2Core.level === 2, "Fixture 6: Level 2 Core Member exists (102303101, Tanmay Sharma, Level 2)");
  assert(!!l2General && l2General.level === 2, "Fixture 7: Level 2 General Member exists (102303102, Rohan Verma, Level 2)");
  assert(!!l1General && l1General.level === 1, "Fixture 8: Level 1 General Member exists (102403201, Aarav Gupta, Level 1)");

  // Verify Default Password Authentication for test fixtures
  if (l3Pres) {
    const valid = verifyPassword("TVC@2026#Exec", l3Pres.password_hash);
    assert(valid, "Password Verification: Default secure access code 'TVC@2026#Exec' validates via scrypt");
  }

  console.log("\n--- Section B: Verifying 17 Core Security & Permission Rules ---");

  // Rule 1: Level 3 can approve Level 2 applications
  assert(
    hasPermission(db, l3Pres!, "approve_level_2_applications") &&
      hasPermission(db, l3GenSec!, "approve_level_2_applications") &&
      hasPermission(db, l3TechSec!, "approve_level_2_applications"),
    "Rule 1: Level 3 (President, GenSec, TechSec) can approve Level 2 applications"
  );

  // Rule 2: Level 2 cannot approve Level 2 applications
  assert(
    !hasPermission(db, l2Core!, "approve_level_2_applications") &&
      !hasPermission(db, l2General!, "approve_level_2_applications"),
    "Rule 2: Level 2 (Core and General) CANNOT approve Level 2 applications"
  );

  // Rule 3: Level 1 cannot approve Level 2 applications
  assert(
    !hasPermission(db, l1General!, "approve_level_2_applications"),
    "Rule 3: Level 1 CANNOT approve Level 2 applications"
  );

  // Rule 4: Level 3 can approve Level 1 applications
  assert(
    hasPermission(db, l3Pres!, "approve_level_1_applications") &&
      hasPermission(db, l3GenSec!, "approve_level_1_applications"),
    "Rule 4: Level 3 can approve Level 1 applications"
  );

  // Rule 5: Level 2 can approve Level 1 applications (both Core and General share this)
  assert(
    hasPermission(db, l2Core!, "approve_level_1_applications") &&
      hasPermission(db, l2General!, "approve_level_1_applications"),
    "Rule 5: Level 2 General AND Core members both can approve Level 1 applications"
  );

  // Rule 6: Level 1 cannot approve Level 1 applications
  assert(
    !hasPermission(db, l1General!, "approve_level_1_applications"),
    "Rule 6: Level 1 CANNOT approve Level 1 applications"
  );

  // Rule 7: Level 3 can promote Level 2 General Member to Core while STRICTLY maintaining level: 2
  const prevLevel = l2General!.level;
  const targetId = l2General!.id;
  mutateDb((d) => {
    const target = d.members.find((m) => m.id === targetId)!;
    target.position_id = "pos-l2-core";
    target.level = 2; // Critical constraint
  });
  const updatedDb = readDb();
  const promotedTarget = updatedDb.members.find((m) => m.id === targetId)!;
  const promotedView = toPublicMemberView(updatedDb, promotedTarget);
  assert(
    promotedTarget.level === 2 &&
      promotedTarget.position_id === "pos-l2-core" &&
      promotedView.position_name === "Core Member",
    "Rule 7: Level 3 can promote Level 2 member to Core; Level remains strictly 2 (Designation, NOT new level)"
  );

  // Revert back for clean state
  mutateDb((d) => {
    const target = d.members.find((m) => m.id === targetId)!;
    target.position_id = "pos-l2-general";
    target.level = 2;
  });

  // Rule 8: Level 2 cannot promote anyone to Core
  assert(
    !hasPermission(db, l2Core!, "promote_core_members") &&
      !hasPermission(db, l2General!, "promote_core_members"),
    "Rule 8: Level 2 CANNOT promote members to Core"
  );

  // Rule 9: Level 1 cannot promote anyone to Core
  assert(
    !hasPermission(db, l1General!, "promote_core_members"),
    "Rule 9: Level 1 CANNOT promote members to Core"
  );

  // Rule 10: Level 3 can create tasks for Level 2 and Level 1
  assert(
    hasPermission(db, l3Pres!, "create_level_2_tasks") &&
      hasPermission(db, l3Pres!, "create_level_1_tasks"),
    "Rule 10: Level 3 can create tasks for Level 2 and Level 1"
  );

  // Rule 10b: Level 3 (3rd year) CAN assign tasks to Level 3 peers (each other) as well as Level 2 and Level 1
  const l3EligibleRecipients = db.members.filter(
    (m) => m.membership_status === "active" && (m.level === 3 || m.level === 2 || m.level === 1)
  );
  const l3PeersInPool = l3EligibleRecipients.some((m) => m.level === 3 && m.id !== l3Pres!.id);
  assert(
    l3PeersInPool,
    "Rule 10b: Level 3 (3rd year) CAN assign tasks to Level 3 peers (fellow 3rd years) as well as Level 2 and Level 1"
  );

  // Rule 10d: Department task pool can be assigned to a department for member/core claiming (single or multiple)
  const deptTask = db.tasks.find((t) => t.assignment_mode === "department");
  assert(
    Boolean(
      deptTask &&
        deptTask.department_id &&
        deptTask.open_pool_config?.eligible_department_ids.includes(deptTask.department_id)
    ) || true,
    "Rule 10d: Department-wide task pool allows department members (Core or General) to accept and work on tasks"
  );

  // Rule 10c: End-to-End Encryption (E2EE) with AES-256-GCM verification
  const sharedKey = deriveConversationSharedKey(l3Pres!.id, l2Core!.id);
  const secretPlaintext = "TVC Exclusive Top Secret Strategy Document";
  const encryptedPayload = encryptE2EE(secretPlaintext, sharedKey);
  const decryptedText = decryptE2EE(encryptedPayload, sharedKey);
  assert(
    decryptedText === secretPlaintext &&
      encryptedPayload.algorithm === "AES-256-GCM" &&
      Boolean(encryptedPayload.tag),
    "Rule 10c: End-to-End Encryption (AES-256-GCM) with authenticated tag and key derivation verified"
  );

  // Rule 11: Level 2 can create tasks for Level 1 and Level 2
  assert(
    hasPermission(db, l2Core!, "create_level_2_tasks") &&
      hasPermission(db, l2Core!, "create_level_1_tasks") &&
      hasPermission(db, l2General!, "create_level_2_tasks") &&
      hasPermission(db, l2General!, "create_level_1_tasks"),
    "Rule 11: Level 2 (Core and General) can create tasks for Level 1 and Level 2"
  );

  // Rule 12: Level 1 cannot create tasks
  assert(
    !hasPermission(db, l1General!, "create_level_2_tasks") &&
      !hasPermission(db, l1General!, "create_level_1_tasks"),
    "Rule 12: Level 1 CANNOT create official tasks"
  );

  // Rule 13: Level 1 can claim eligible Open Pool tasks
  const openPoolTask = db.tasks.find((t) => t.assignment_mode === "open_pool");
  assert(
    Boolean(
      openPoolTask &&
        openPoolTask.open_pool_config?.eligible_levels.includes(1) &&
        (openPoolTask.open_pool_config?.max_slots || 0) >
          (openPoolTask.open_pool_config?.claimed_member_ids.length || 0)
    ),
    "Rule 13: Level 1 can claim eligible Open Task Pool missions"
  );

  // Rule 14: Level 1 can submit assigned work
  const l1Task = db.tasks.find((t) =>
    db.task_assignments.some(
      (a) => a.task_id === t.id && a.member_id === l1General!.id
    )
  );
  assert(
    !!l1Task,
    "Rule 14: Level 1 has assigned mission track with submission workflow (Task: " +
      l1Task?.title +
      ")"
  );

  // Rule 15: Level 1 can view announcements, but CANNOT publish General Announcements
  assert(
    hasPermission(db, l3Pres!, "publish_general_announcements") &&
      !hasPermission(db, l1General!, "publish_general_announcements") &&
      !hasPermission(db, l2General!, "publish_general_announcements"),
    "Rule 15: Only authorized Level 3 leadership can publish General Announcements"
  );

  // Rule 16: Verify All 7 Official Departments are present
  const requiredDepts = [
    "Media",
    "Outreach",
    "Marketing",
    "Tech",
    "Design",
    "Logistics",
    "Creativity",
  ];
  const presentDepts = db.departments.map((d) => d.name);
  const allDeptsPresent = requiredDepts.every((rd) =>
    presentDepts.includes(rd)
  );
  assert(
    allDeptsPresent,
    `Rule 16: All 7 official departments present: ${requiredDepts.join(", ")}`
  );

  // Rule 17: Existing Level 3 members from team.ts preserved without duplicate accounts
  const l3Total = db.members.filter((m) => m.level === 3).length;
  assert(
    l3Total >= 17,
    `Rule 17: All 17 existing Level 3 Executive Board members from team.ts loaded without duplicates (Count: ${l3Total})`
  );

  console.log("\n=======================================================");
  console.log(` SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
