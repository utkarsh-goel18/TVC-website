import fs from "fs";
import path from "path";
import { executiveBoardGroups } from "@/data/team";
import { hashPassword, generateSecureToken, generateProvisionedPassword } from "./crypto";
import {
  TVCExclusiveDatabaseSchema,
  MemberRecord,
  PublicMemberView,
  PermissionKey,
  PositionRecord,
  DepartmentRecord,
  OrganisationalLevel,
  NotificationRecord,
  NotificationType,
} from "./types";
import { realtimeHub } from "./realtime";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "tvc-exclusive-db.json");

// Test fixture & initial provisioned credential (documented in README & Login Quick-Test Drawer)
export const DEFAULT_FIXTURE_ACCESS_CODE = "TVC@2026#Exec";

const DEFAULT_NOTIFICATION_PREFS = {
  direct_messages: true,
  group_messages: true,
  announcements: true,
  task_updates: true,
  applications: true,
  promotions: true,
  deadlines: true,
  push_enabled: true,
  muted_conversations: [] as string[],
};

function mapPositionTitleToSlug(title: string): string {
  const lower = title.toLowerCase().trim();
  if (lower === "president") return "president";
  if (lower.includes("general secretary")) return "general_secretary";
  if (lower.includes("joint secretary")) return "joint_secretary";
  if (lower.includes("finance secretary")) return "finance_secretary";
  if (lower.includes("technical secretary") || lower.includes("tech secretary"))
    return "tech_secretary";
  if (lower.includes("media") || lower.includes("design secretary"))
    return "design_secretary";
  if (lower.includes("marketing")) return "marketing_secretary";
  if (lower.includes("outreach")) return "outreach_secretary";
  if (lower.includes("entrepreneurship")) return "head_of_entrepreneurship";
  if (lower.includes("operations")) return "head_of_operations";
  if (lower.includes("co-convener")) return "co_convener";
  return lower.replace(/[^a-z0-9]+/g, "_");
}

function createInitialSeed(): TVCExclusiveDatabaseSchema {
  const now = new Date().toISOString();
  const passwordHash = hashPassword(DEFAULT_FIXTURE_ACCESS_CODE, "tvc2026fixedsalt01");

  const permissions: TVCExclusiveDatabaseSchema["permissions"] = [
    {
      id: "perm-approve-l2",
      key: "approve_level_2_applications",
      description: "Review and approve or reject Level 2 (Second-Year) membership applications",
    },
    {
      id: "perm-approve-l1",
      key: "approve_level_1_applications",
      description: "Review and approve or reject Level 1 (First-Year) membership applications",
    },
    {
      id: "perm-promote-core",
      key: "promote_core_members",
      description: "Promote Level 2 General Members to Core designation or revoke Core designation",
    },
    {
      id: "perm-create-l2-tasks",
      key: "create_level_2_tasks",
      description: "Create and assign official tasks to Level 2 members",
    },
    {
      id: "perm-create-l1-tasks",
      key: "create_level_1_tasks",
      description: "Create and assign official tasks to Level 1 members",
    },
    {
      id: "perm-manage-depts",
      key: "manage_departments",
      description: "Add/remove department members and manage department configurations",
    },
    {
      id: "perm-manage-positions",
      key: "manage_positions",
      description: "Add, edit, or deactivate official positions without code changes",
    },
    {
      id: "perm-manage-members",
      key: "manage_members",
      description: "Activate, deactivate, or provision TVC member accounts",
    },
    {
      id: "perm-manage-perms",
      key: "manage_permissions",
      description: "Configure position permissions and explicit member permission grants",
    },
    {
      id: "perm-publish-announcements",
      key: "publish_general_announcements",
      description: "Publish organization-wide announcements in General Announcements",
    },
    {
      id: "perm-audit-logs",
      key: "view_audit_logs",
      description: "Inspect administrative audit history logs",
    },
  ];

  const positions: PositionRecord[] = [
    {
      id: "pos-president",
      name: "President",
      slug: "president",
      organisational_level: 3,
      description: "Executive President of Thapar Venture Club",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-general-secretary",
      name: "General Secretary",
      slug: "general_secretary",
      organisational_level: 3,
      description: "Executive General Secretary overseeing club strategy and operations",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-joint-secretary",
      name: "Joint Secretary",
      slug: "joint_secretary",
      organisational_level: 3,
      description: "Executive Joint Secretary coordinating cross-department execution",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-design-secretary",
      name: "Media and Design Secretary",
      slug: "design_secretary",
      organisational_level: 3,
      description: "Executive Secretary leading visual identity, UI/UX, and media production",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-tech-secretary",
      name: "Technical Secretary",
      slug: "tech_secretary",
      organisational_level: 3,
      description: "Executive Secretary leading engineering, web/mobile platforms, and tech",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-marketing-secretary",
      name: "Marketing and External Secretary",
      slug: "marketing_secretary",
      organisational_level: 3,
      description: "Executive Secretary leading brand growth, sponsorships, and external affairs",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-outreach-secretary",
      name: "Outreach Secretary",
      slug: "outreach_secretary",
      organisational_level: 3,
      description: "Executive Secretary leading speaker relations, partnerships, and outreach",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-media-secretary",
      name: "Media Secretary",
      slug: "media_secretary",
      organisational_level: 3,
      description: "Executive Secretary leading cinematography, photography, and media coverage",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-finance-secretary",
      name: "Finance Secretary",
      slug: "finance_secretary",
      organisational_level: 3,
      description: "Executive Secretary overseeing treasury, budgeting, and compliance",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-head-entrepreneurship",
      name: "Head of Entrepreneurship",
      slug: "head_of_entrepreneurship",
      organisational_level: 3,
      description: "Executive Head driving venture incubation and founder programs",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-head-operations",
      name: "Head of Operations",
      slug: "head_of_operations",
      organisational_level: 3,
      description: "Executive Head overseeing campus logistics and flagship event execution",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-co-convener",
      name: "Co-Convener",
      slug: "co_convener",
      organisational_level: 3,
      description: "Executive Co-Convener for flagship summits and institutional initiatives",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-l2-core",
      name: "Core Member",
      slug: "core",
      organisational_level: 2,
      description: "Second-Year Core Member designation with task and L1 onboarding leadership",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-l2-general",
      name: "General Member",
      slug: "general_member",
      organisational_level: 2,
      description: "Second-Year General Member with full Level 2 task & L1 review privileges",
      is_active: true,
      created_at: now,
    },
    {
      id: "pos-l1-general",
      name: "General Member",
      slug: "l1_general_member",
      organisational_level: 1,
      description: "First-Year General Member participating in departments, communities, and tasks",
      is_active: true,
      created_at: now,
    },
  ];

  // Assign permissions to positions explicitly (never hardcoded by position name in business logic)
  const position_permissions: TVCExclusiveDatabaseSchema["position_permissions"] = [];
  const allLevel3Perms = permissions.map((p) => p.id);
  const level2Perms = [
    "perm-approve-l1",
    "perm-create-l2-tasks",
    "perm-create-l1-tasks",
  ];

  for (const pos of positions) {
    if (pos.organisational_level === 3) {
      for (const permId of allLevel3Perms) {
        position_permissions.push({ position_id: pos.id, permission_id: permId });
      }
    } else if (pos.organisational_level === 2) {
      for (const permId of level2Perms) {
        position_permissions.push({ position_id: pos.id, permission_id: permId });
      }
    }
  }

  // 7 Official Departments
  const departments: DepartmentRecord[] = [
    {
      id: "dept-media",
      name: "Media",
      slug: "media",
      description: "Cinematography, aftermovies, reels, photography, and live event production.",
      accent_color: "#f5ed00",
      created_at: now,
    },
    {
      id: "dept-outreach",
      name: "Outreach",
      slug: "outreach",
      description: "Speaker curation, VC/founder relations, institutional collaborations, and PR.",
      accent_color: "#38bdf8",
      created_at: now,
    },
    {
      id: "dept-marketing",
      name: "Marketing",
      slug: "marketing",
      description: "Corporate sponsorships, brand partnerships, growth campaigns, and campus reach.",
      accent_color: "#fb923c",
      created_at: now,
    },
    {
      id: "dept-tech",
      name: "Tech",
      slug: "tech",
      description: "Full-stack platforms, mobile engineering, internal portals, and B-Hackathon infra.",
      accent_color: "#a3ff12",
      created_at: now,
    },
    {
      id: "dept-design",
      name: "Design",
      slug: "design",
      description: "Brand systems, UI/UX design, stage scenography, and editorial graphics.",
      accent_color: "#e879f9",
      created_at: now,
    },
    {
      id: "dept-logistics",
      name: "Logistics",
      slug: "logistics",
      description: "Venue operations, hospitality, security, procurement, and on-ground command.",
      accent_color: "#2dd4bf",
      created_at: now,
    },
    {
      id: "dept-creativity",
      name: "Creativity",
      slug: "creativity",
      description: "Content strategy, copywriting, event concepts, case study design, and storytelling.",
      accent_color: "#f43f5e",
      created_at: now,
    },
  ];

  // Build Level 3 Members directly from existing src/data/team.ts records + President fixture
  const members: MemberRecord[] = [];
  const member_departments: TVCExclusiveDatabaseSchema["member_departments"] = [];

  // Test Fixture 1: Level 3 President
  members.push({
    id: "member-president",
    name: "Pranav Kapoor",
    roll_number: "102203000",
    username: "president",
    email: "pkapoor_be22@thapar.edu",
    phone: "+91 98765 03000",
    level: 3,
    academic_year: "4th Year",
    position_id: "pos-president",
    membership_status: "active",
    profile_image: "/brand/tvc-rocket-emblem.png",
    bio: "President at Thapar Venture Club. Building TIET's flagship founder & venture ecosystem.",
    skills: ["Venture Strategy", "Leadership", "Ecosystem Building", "Product"],
    interests: ["DeepTech", "SaaS", "Angel Investing"],
    linkedin: "https://www.linkedin.com/school/thaparventureclub/",
    password_hash: passwordHash,
    must_change_password: false,
    notification_preferences: { ...DEFAULT_NOTIFICATION_PREFS },
    joined_at: "2023-08-15T10:00:00.000Z",
    created_at: now,
    updated_at: now,
  });

  member_departments.push(
    {
      member_id: "member-president",
      department_id: "dept-outreach",
      assigned_by: "member-president",
      assigned_at: now,
    },
    {
      member_id: "member-president",
      department_id: "dept-tech",
      assigned_by: "member-president",
      assigned_at: now,
    }
  );

  // Import all 17 existing Executive Board (Level 3) members from src/data/team.ts
  let rollCounter = 1;
  const flatEbMembers = executiveBoardGroups.flatMap((g) => g.members);

  for (const eb of flatEbMembers) {
    const rollNumber = `102203${String(rollCounter).padStart(3, "0")}`;
    const slug = mapPositionTitleToSlug(eb.position);
    const matchedPos =
      positions.find((p) => p.slug === slug && p.organisational_level === 3) ||
      positions[1];

    const memberId = `member-${eb.id}`;
    members.push({
      id: memberId,
      name: eb.name,
      roll_number: rollNumber,
      username: eb.id,
      email: `${eb.id.replace(/-/g, ".")}@thapar.edu`,
      phone: `+91 98765 ${String(3000 + rollCounter).padStart(5, "0")}`,
      level: 3,
      academic_year: "4th Year",
      position_id: matchedPos.id,
      membership_status: "active",
      profile_image: eb.image,
      bio: `${eb.position} at Thapar Venture Club (Executive Board).`,
      skills: ["Executive Leadership", "Venture Operations", "Event Architecture"],
      interests: ["Entrepreneurship", "Startups", "Venture Capital"],
      linkedin: eb.linkedin,
      password_hash: passwordHash,
      must_change_password: false,
      notification_preferences: { ...DEFAULT_NOTIFICATION_PREFS },
      joined_at: "2023-09-01T10:00:00.000Z",
      created_at: now,
      updated_at: now,
    });

    // Assign departments relevant to their role
    if (slug === "tech_secretary") {
      member_departments.push({
        member_id: memberId,
        department_id: "dept-tech",
        assigned_by: "member-president",
        assigned_at: now,
      });
    } else if (slug === "design_secretary") {
      member_departments.push(
        {
          member_id: memberId,
          department_id: "dept-design",
          assigned_by: "member-president",
          assigned_at: now,
        },
        {
          member_id: memberId,
          department_id: "dept-media",
          assigned_by: "member-president",
          assigned_at: now,
        }
      );
    } else if (slug === "marketing_secretary") {
      member_departments.push(
        {
          member_id: memberId,
          department_id: "dept-marketing",
          assigned_by: "member-president",
          assigned_at: now,
        },
        {
          member_id: memberId,
          department_id: "dept-outreach",
          assigned_by: "member-president",
          assigned_at: now,
        }
      );
    } else if (slug === "head_of_operations") {
      member_departments.push({
        member_id: memberId,
        department_id: "dept-logistics",
        assigned_by: "member-president",
        assigned_at: now,
      });
    } else {
      const deptIdx = (rollCounter - 1) % departments.length;
      member_departments.push({
        member_id: memberId,
        department_id: departments[deptIdx].id,
        assigned_by: "member-president",
        assigned_at: now,
      });
    }

    rollCounter++;
  }

  // Level 2 Members (Core & General Members)
  const level2Seed = [
    {
      id: "member-l2-core-1",
      name: "Arjun Mehta",
      roll_number: "102303101",
      username: "arjun-mehta",
      email: "amehta_be23@thapar.edu",
      phone: "+91 98111 23101",
      position_id: "pos-l2-core",
      bio: "Level 2 Core Member in Tech & Design. Leading PRIMUS'26 portal modules and mentoring first-year associates.",
      skills: ["Next.js", "TypeScript", "Figma", "System Design"],
      interests: ["Product Engineering", "FinTech", "UI/UX"],
      depts: ["dept-tech", "dept-design"],
    },
    {
      id: "member-l2-general-1",
      name: "Riya Sharma",
      roll_number: "102303102",
      username: "riya-sharma",
      email: "rsharma_be23@thapar.edu",
      phone: "+91 98111 23102",
      position_id: "pos-l2-general",
      bio: "Second-Year General Member driving Marketing & Outreach sponsorships for Flagship E-Summit.",
      skills: ["Corporate Relations", "Pitch Decks", "Brand Strategy"],
      interests: ["Consumer Brands", "Growth Marketing", "Venture Capital"],
      depts: ["dept-marketing", "dept-outreach"],
    },
    {
      id: "member-l2-general-2",
      name: "Kabir Bedi",
      roll_number: "102303103",
      username: "kabir-bedi",
      email: "kbedi_be23@thapar.edu",
      phone: "+91 98111 23103",
      position_id: "pos-l2-general",
      bio: "Second-Year General Member in Media & Creativity. Directing E-Summit teasers and founder stories.",
      skills: ["Premiere Pro", "After Effects", "Copywriting", "Storyboarding"],
      interests: ["Media Production", "Brand Films"],
      depts: ["dept-media", "dept-creativity"],
    },
    {
      id: "member-l2-core-2",
      name: "Ananya Verma",
      roll_number: "102303104",
      username: "ananya-verma",
      email: "averma_be23@thapar.edu",
      phone: "+91 98111 23104",
      position_id: "pos-l2-core",
      bio: "Second-Year Core Member coordinating Logistics and Outreach for guest speakers.",
      skills: ["Operations", "Event Logistics", "Speaker Relations"],
      interests: ["Supply Chain", "Operations", "Consulting"],
      depts: ["dept-logistics", "dept-outreach"],
    },
  ];

  for (const m of level2Seed) {
    members.push({
      id: m.id,
      name: m.name,
      roll_number: m.roll_number,
      username: m.username,
      email: m.email,
      phone: m.phone,
      level: 2,
      academic_year: "2nd Year",
      position_id: m.position_id,
      membership_status: "active",
      bio: m.bio,
      skills: m.skills,
      interests: m.interests,
      password_hash: passwordHash,
      must_change_password: false,
      notification_preferences: { ...DEFAULT_NOTIFICATION_PREFS },
      joined_at: "2024-08-20T10:00:00.000Z",
      created_at: now,
      updated_at: now,
    });
    for (const d of m.depts) {
      member_departments.push({
        member_id: m.id,
        department_id: d,
        assigned_by: "member-sanchit-sehgal",
        assigned_at: now,
      });
    }
  }

  // Level 1 Members (First-Year General Members)
  const level1Seed = [
    {
      id: "member-l1-general-1",
      name: "Aarav Gupta",
      roll_number: "102403201",
      username: "aarav-gupta",
      email: "agupta_be24@thapar.edu",
      phone: "+91 98222 24201",
      bio: "First-Year General Member in Tech & Design. Building interactive frontend components for TVC.",
      skills: ["React", "Tailwind CSS", "UI Design"],
      interests: ["Web Development", "AI Startups"],
      depts: ["dept-tech", "dept-design"],
    },
    {
      id: "member-l1-general-2",
      name: "Meera Nair",
      roll_number: "102403202",
      username: "meera-nair",
      email: "mnair_be24@thapar.edu",
      phone: "+91 98222 24202",
      bio: "First-Year General Member in Marketing & Creativity. Crafting social campaigns and founder spotlights.",
      skills: ["Content Writing", "Canva", "Social Media Analytics"],
      interests: ["D2C Brands", "Storytelling"],
      depts: ["dept-marketing", "dept-creativity"],
    },
    {
      id: "member-l1-general-3",
      name: "Rohan Joshi",
      roll_number: "102403203",
      username: "rohan-joshi",
      email: "rjoshi_be24@thapar.edu",
      phone: "+91 98222 24203",
      bio: "First-Year General Member in Logistics & Media. Supporting venue setup and photography.",
      skills: ["Photography", "Venue Management", "Vendor Coordination"],
      interests: ["Event Production", "Hardware"],
      depts: ["dept-logistics", "dept-media"],
    },
  ];

  for (const m of level1Seed) {
    members.push({
      id: m.id,
      name: m.name,
      roll_number: m.roll_number,
      username: m.username,
      email: m.email,
      phone: m.phone,
      level: 1,
      academic_year: "1st Year",
      position_id: "pos-l1-general",
      membership_status: "active",
      bio: m.bio,
      skills: m.skills,
      interests: m.interests,
      password_hash: passwordHash,
      must_change_password: false,
      notification_preferences: { ...DEFAULT_NOTIFICATION_PREFS },
      joined_at: "2025-09-01T10:00:00.000Z",
      created_at: now,
      updated_at: now,
    });
    for (const d of m.depts) {
      member_departments.push({
        member_id: m.id,
        department_id: d,
        assigned_by: "member-l2-core-1",
        assigned_at: now,
      });
    }
  }

  // Sample Membership Applications (Pending Level 2 & Level 1)
  const membership_applications: TVCExclusiveDatabaseSchema["membership_applications"] = [
    {
      id: "app-l2-001",
      full_name: "Ishaan Malhotra",
      roll_number: "102303155",
      email: "imalhotra_be23@thapar.edu",
      phone: "+91 98711 03155",
      academic_year: "2nd Year",
      requested_level: 2,
      department_interests: ["Tech", "Design"],
      skills: ["React Native", "Node.js", "PostgreSQL", "Figma"],
      previous_experience: "Built campus hackathon portal and led UI/UX for 2 student projects.",
      motivation:
        "Want to contribute to TVC's engineering infrastructure and help scale PRIMUS'26 and Flagship E-Summit.",
      additional_info: "GitHub: github.com/ishaan-m | Portfolio available on request.",
      status: "pending",
      submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    },
    {
      id: "app-l2-002",
      full_name: "Tanya Bansal",
      roll_number: "102303162",
      email: "tbansal_be23@thapar.edu",
      phone: "+91 98711 03162",
      academic_year: "2nd Year",
      requested_level: 2,
      department_interests: ["Marketing", "Outreach"],
      skills: ["Sponsorship Pitching", "Corporate Communication", "Market Research"],
      previous_experience: "Secured 3 regional sponsors for departmental fest in first year.",
      motivation:
        "Passionate about connecting TIET student founders with national VCs and corporate partners.",
      additional_info: "Available 12+ hours/week for outreach sprints.",
      status: "pending",
      submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "app-l1-001",
      full_name: "Vivaan Khanna",
      roll_number: "102403288",
      email: "vkhanna_be24@thapar.edu",
      phone: "+91 98722 03288",
      academic_year: "1st Year",
      requested_level: 1,
      department_interests: ["Media", "Creativity"],
      skills: ["DaVinci Resolve", "Motion Graphics", "Scriptwriting"],
      previous_experience: "Edited high-school entrepreneurship summit aftermovie (25k+ views).",
      motivation:
        "Excited to learn from TVC's creative team and craft high-impact visual stories for campus events.",
      additional_info: "Own mirrorless camera kit.",
      status: "pending",
      submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "app-l1-002",
      full_name: "Diya Chatterjee",
      roll_number: "102403294",
      email: "dchatterjee_be24@thapar.edu",
      phone: "+91 98722 03294",
      academic_year: "1st Year",
      requested_level: 1,
      department_interests: ["Tech", "Outreach"],
      skills: ["TypeScript", "Python", "Public Speaking"],
      previous_experience: "High school debate captain & web developer.",
      motivation:
        "Want to build technical products and host founder sessions at Thapar Venture Club.",
      additional_info: "Ready to start immediately.",
      status: "pending",
      submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];

  // Sample Tasks (Demonstrating Level 3 -> Level 2 parent task, Level 2 -> Level 1 cascading subtask, and Open Pool task)
  const tasks: TVCExclusiveDatabaseSchema["tasks"] = [
    {
      id: "task-parent-001",
      title: "PRIMUS'26 Brand Identity & Keynote Stage Package",
      description:
        "Design the complete visual identity, keynote stage LED backdrop templates, and speaker reveal deck for PRIMUS'26.",
      instructions:
        "Follow TVC's dark editorial aesthetic (#0d0d0d canvas, #f5ed00 accent). Break down asset production into subtasks for Level 1 associates as needed.",
      expected_deliverables:
        "1. Master Figma system link\n2. 4K LED stage backdrop exports\n3. Social announcement templates",
      reference_links: ["https://thaparventureclub.in/events/tvc-x-sat"],
      created_by: "member-vansh-goyal",
      department_id: "dept-design",
      priority: "high",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      assignment_mode: "individual",
      status: "in_progress",
      progress: 65,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: "task-sub-001",
      title: "Speaker Spotlight Social Cards (Subtask)",
      description:
        "Create 12 responsive Instagram & LinkedIn speaker cards matching the PRIMUS'26 master grid.",
      instructions:
        "Use the master typography tokens from parent task #task-parent-001 and export 1080x1350 PNGs.",
      expected_deliverables: "Figma frame link + exported PNG folder link",
      reference_links: ["https://thaparventureclub.in/speakers"],
      created_by: "member-l2-core-1",
      parent_task_id: "task-parent-001",
      department_id: "dept-design",
      priority: "medium",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      assignment_mode: "individual",
      status: "submitted",
      progress: 100,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "task-pool-001",
      title: "E-Summit'26 Founder hospitality & Airport Reception Desk",
      description:
        "Coordinate guest speaker arrival schedules, welcome kits, and VIP green-room readiness during E-Summit.",
      instructions:
        "Open task pool for Level 1 & Level 2 members across Logistics and Outreach. Claim a slot to join the reception squad.",
      expected_deliverables: "Completed flight tracker sheet + on-ground checklist sign-off",
      reference_links: ["https://thaparventureclub.in/events/e-summit"],
      created_by: "member-sanchit-sehgal",
      department_id: "dept-logistics",
      priority: "high",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      assignment_mode: "open_pool",
      open_pool_config: {
        eligible_levels: [1, 2],
        eligible_department_ids: ["dept-logistics", "dept-outreach"],
        max_slots: 3,
        claimed_member_ids: ["member-l1-general-3"],
        claim_deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      status: "in_progress",
      progress: 35,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "task-tech-001",
      title: "B-Hackathon Live Leaderboard & Judge Scoring Portal QA",
      description:
        "Verify real-time scoring calculations, mobile responsiveness, and rate-limiting on the judge evaluation endpoints.",
      instructions:
        "Run load tests and submit the QA verification report.",
      expected_deliverables: "Playwright / Lighthouse report + bug resolution PR",
      reference_links: [],
      created_by: "member-vidhi-saxena",
      department_id: "dept-tech",
      priority: "critical",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      assignment_mode: "multiple",
      status: "in_progress",
      progress: 50,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ];

  const task_assignments: TVCExclusiveDatabaseSchema["task_assignments"] = [
    {
      id: "ta-001",
      task_id: "task-parent-001",
      member_id: "member-l2-core-1",
      status: "in_progress",
      progress: 65,
      submission_links: [],
      accepted_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: "ta-002",
      task_id: "task-sub-001",
      member_id: "member-l1-general-1",
      status: "submitted",
      progress: 100,
      submission_notes:
        "Completed all 12 speaker cards following the monochrome + #f5ed00 accent grid. Ready for Core review.",
      submission_links: ["https://figma.com/file/tvc-primus26-speaker-cards"],
      accepted_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "ta-003",
      task_id: "task-pool-001",
      member_id: "member-l1-general-3",
      status: "in_progress",
      progress: 35,
      submission_links: [],
      accepted_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "ta-004",
      task_id: "task-tech-001",
      member_id: "member-l2-core-1",
      status: "in_progress",
      progress: 50,
      submission_links: [],
      accepted_at: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    },
    {
      id: "ta-005",
      task_id: "task-tech-001",
      member_id: "member-l2-general-1",
      status: "accepted",
      progress: 30,
      submission_links: [],
      accepted_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    },
  ];

  const task_comments: TVCExclusiveDatabaseSchema["task_comments"] = [
    {
      id: "tc-001",
      task_id: "task-parent-001",
      member_id: "member-vansh-goyal",
      content:
        "Make sure the rocket emblem watermark stays at 8% opacity on dark backgrounds.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "tc-002",
      task_id: "task-parent-001",
      member_id: "member-l2-core-1",
      content:
        "Noted! I've delegated the 12 speaker social cards as a subtask to Aarav (Level 1) and will review before merging.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    },
    {
      id: "tc-003",
      task_id: "task-sub-001",
      member_id: "member-l1-general-1",
      content: "Uploaded the exported cards and Figma frame link for review.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];

  const task_activity: TVCExclusiveDatabaseSchema["task_activity"] = [
    {
      id: "tact-001",
      task_id: "task-parent-001",
      actor_id: "member-vansh-goyal",
      action: "TASK_CREATED",
      metadata: { assignment_mode: "individual", target: "Arjun Mehta (L2 Core)" },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    },
    {
      id: "tact-002",
      task_id: "task-sub-001",
      actor_id: "member-l2-core-1",
      action: "SUBTASK_CREATED",
      metadata: { parent_task_id: "task-parent-001", target: "Aarav Gupta (L1)" },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: "tact-003",
      task_id: "task-sub-001",
      actor_id: "member-l1-general-1",
      action: "WORK_SUBMITTED",
      metadata: { progress: 100 },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];

  // Conversations (General Announcements, 3 Level Communities, 7 Department Communities, Direct Messages)
  const conversations: TVCExclusiveDatabaseSchema["conversations"] = [
    {
      id: "conv-announcements",
      type: "announcement",
      title: "General Announcements",
      subtitle: "Official organisation-wide dispatches from TVC Executive Leadership (Level 3)",
      created_at: now,
    },
    {
      id: "conv-level-3",
      type: "level",
      title: "Level 3 — Executive Leadership",
      subtitle: "Private council channel for President, Secretaries, and Executive Board",
      level: 3,
      created_at: now,
    },
    {
      id: "conv-level-2",
      type: "level",
      title: "Level 2 — Second-Year Collective",
      subtitle: "Private workspace channel for Level 2 Core & General Members",
      level: 2,
      created_at: now,
    },
    {
      id: "conv-level-1",
      type: "level",
      title: "Level 1 — First-Year Associates",
      subtitle: "Private community channel for Level 1 First-Year Members",
      level: 1,
      created_at: now,
    },
    ...departments.map((d) => ({
      id: `conv-${d.id}`,
      type: "department" as const,
      title: `${d.name} Department`,
      subtitle: d.description,
      department_id: d.id,
      created_at: now,
    })),
    {
      id: "conv-dm-sanchit-arjun",
      type: "direct",
      title: "Direct Message",
      subtitle: "Sanchit Sehgal & Arjun Mehta",
      participant_ids: ["member-sanchit-sehgal", "member-l2-core-1"],
      created_at: now,
    },
  ];

  const messages: TVCExclusiveDatabaseSchema["messages"] = [
    {
      id: "msg-ann-001",
      conversation_id: "conv-announcements",
      sender_id: "member-president",
      content:
        "Welcome to TVC Exclusive — our unified internal operating system. All flagship sprint tasks for PRIMUS'26 and E-Summit'26, department channels, and onboarding workflows are now live here.",
      links: ["https://thaparventureclub.in/events"],
      is_pinned: true,
      read_by: members.map((m) => m.id),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: "msg-ann-002",
      conversation_id: "conv-announcements",
      sender_id: "member-sanchit-sehgal",
      content:
        "All Level 2 Core & General Members: Level 1 associate applications for the new semester are open in the Applications tab. Please review candidates aligned with your department interests.",
      links: [],
      is_pinned: true,
      read_by: ["member-president", "member-sanchit-sehgal", "member-l2-core-1"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    },
    {
      id: "msg-l3-001",
      conversation_id: "conv-level-3",
      sender_id: "member-sanchit-sehgal",
      content:
        "Executive Board sync at 8:00 PM tonight to finalize Level 2 Core promotions and review the two pending second-year applications.",
      links: [],
      is_pinned: false,
      read_by: ["member-president", "member-sanchit-sehgal", "member-aadish-jain"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "msg-l2-001",
      conversation_id: "conv-level-2",
      sender_id: "member-l2-core-1",
      content:
        "Hey team! Let's coordinate on the Level 1 task breakdown so every first-year member gets hands-on deliverables this week.",
      links: [],
      is_pinned: false,
      read_by: ["member-l2-core-1", "member-l2-general-1"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "msg-l1-001",
      conversation_id: "conv-level-1",
      sender_id: "member-l1-general-1",
      content:
        "Just submitted the Speaker Spotlight social cards subtask! Also check out the Open Task Pool if anyone wants to join the E-Summit reception squad.",
      links: [],
      is_pinned: false,
      read_by: ["member-l1-general-1", "member-l1-general-2"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: "msg-dept-tech-001",
      conversation_id: "conv-dept-tech",
      sender_id: "member-vidhi-saxena",
      content:
        "Tech department: Please review the B-Hackathon leaderboard QA task before Friday's deployment freeze.",
      links: [],
      is_pinned: true,
      read_by: ["member-vidhi-saxena", "member-l2-core-1", "member-l1-general-1"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: "msg-dm-001",
      conversation_id: "conv-dm-sanchit-arjun",
      sender_id: "member-sanchit-sehgal",
      content:
        "Hi Arjun, how is the PRIMUS'26 stage package coming along? Let me know if you need additional Design associates.",
      links: [],
      is_pinned: false,
      read_by: ["member-sanchit-sehgal", "member-l2-core-1"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "msg-dm-002",
      conversation_id: "conv-dm-sanchit-arjun",
      sender_id: "member-l2-core-1",
      content:
        "Going great! Aarav just submitted the speaker spotlight subtask and I'm reviewing it now.",
      links: [],
      is_pinned: false,
      read_by: ["member-l2-core-1"],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
  ];

  const notifications: NotificationRecord[] = [
    {
      id: "notif-001",
      recipient_id: "member-sanchit-sehgal",
      type: "direct_message",
      title: "New message from Arjun Mehta",
      body: "Going great! Aarav just submitted the speaker spotlight subtask...",
      reference_type: "conversation",
      reference_id: "conv-dm-sanchit-arjun",
      deep_link: "/members?module=connect&conversation=conv-dm-sanchit-arjun",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: "notif-002",
      recipient_id: "member-sanchit-sehgal",
      type: "application_accepted",
      title: "2 Pending Level 2 Applications",
      body: "Ishaan Malhotra and Tanya Bansal have applied for Level 2 membership.",
      reference_type: "application",
      reference_id: "app-l2-001",
      deep_link: "/members?module=applications",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "notif-003",
      recipient_id: "member-l2-core-1",
      type: "task_submitted",
      title: "Subtask Submitted for Review",
      body: "Aarav Gupta submitted 'Speaker Spotlight Social Cards (Subtask)'.",
      reference_type: "task",
      reference_id: "task-sub-001",
      deep_link: "/members?module=tasks&task=task-sub-001",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "notif-004",
      recipient_id: "member-l1-general-1",
      type: "announcement",
      title: "Pinned Announcement from President",
      body: "Welcome to TVC Exclusive — our unified internal operating system.",
      reference_type: "conversation",
      reference_id: "conv-announcements",
      deep_link: "/members?module=connect&conversation=conv-announcements",
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ];

  const audit_logs: TVCExclusiveDatabaseSchema["audit_logs"] = [
    {
      id: "audit-001",
      actor_id: "member-president",
      action: "SYSTEM_PROVISIONED",
      target_type: "ecosystem",
      target_id: "tvc-exclusive",
      summary:
        "Initialized TVC Exclusive with 18 Level 3 Executive accounts, 7 departments, and role-independent permission matrix.",
      metadata: { level_3_count: 18, departments: 7 },
      created_at: now,
    },
    {
      id: "audit-002",
      actor_id: "member-sanchit-sehgal",
      action: "CORE_PROMOTION",
      target_type: "member",
      target_id: "member-l2-core-1",
      summary: "Promoted Arjun Mehta (102303101) from Level 2 General Member to Level 2 Core Member.",
      metadata: { previous_position: "pos-l2-general", new_position: "pos-l2-core", level: 2 },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];

  return {
    positions,
    permissions,
    position_permissions,
    members,
    member_permissions: [],
    sessions: [],
    password_reset_tokens: [],
    departments,
    member_departments,
    member_position_history: [
      {
        id: "mph-001",
        member_id: "member-l2-core-1",
        previous_position_id: "pos-l2-general",
        new_position_id: "pos-l2-core",
        previous_level: 2,
        new_level: 2,
        reason: "Outstanding leadership in PRIMUS'26 engineering & design sprints",
        changed_by: "member-sanchit-sehgal",
        changed_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
    ],
    membership_applications,
    application_reviews: [],
    tasks,
    task_assignments,
    task_comments,
    task_attachments: [],
    task_activity,
    conversations,
    conversation_members: [],
    messages,
    notifications,
    device_tokens: [],
    audit_logs,
  };
}

const globalForDb = globalThis as unknown as {
  tvcExclusiveDbCache?: TVCExclusiveDatabaseSchema;
};

export function readDb(): TVCExclusiveDatabaseSchema {
  if (globalForDb.tvcExclusiveDbCache) {
    return globalForDb.tvcExclusiveDbCache;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(raw) as TVCExclusiveDatabaseSchema;
      globalForDb.tvcExclusiveDbCache = parsed;
      return parsed;
    }
  } catch {
    // Fallback to fresh seed if corrupted
  }
  const initial = createInitialSeed();
  writeDb(initial);
  return initial;
}

export function writeDb(db: TVCExclusiveDatabaseSchema): void {
  globalForDb.tvcExclusiveDbCache = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tmpFile, DB_FILE);
  } catch {
    // Ignore read-only fs errors in serverless environments where memory cache persists
  }
}

export function mutateDb<T>(fn: (db: TVCExclusiveDatabaseSchema) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

/**
 * Resolves the effective PermissionKeys for a member based on:
 * 1. Their assigned position's permissions (`position_permissions`)
 * 2. Any explicit per-member permission grants (`member_permissions`)
 * Never hardcodes position names!
 */
export function getMemberPermissions(
  db: TVCExclusiveDatabaseSchema,
  member: MemberRecord
): PermissionKey[] {
  if (member.membership_status !== "active") {
    return [];
  }
  const posPermIds = db.position_permissions
    .filter((pp) => pp.position_id === member.position_id)
    .map((pp) => pp.permission_id);

  const memberPermIds = db.member_permissions
    .filter((mp) => mp.member_id === member.id)
    .map((mp) => mp.permission_id);

  const allPermIds = new Set([...posPermIds, ...memberPermIds]);
  return db.permissions
    .filter((p) => allPermIds.has(p.id))
    .map((p) => p.key);
}

export function hasPermission(
  db: TVCExclusiveDatabaseSchema,
  member: MemberRecord,
  permission: PermissionKey
): boolean {
  return getMemberPermissions(db, member).includes(permission);
}

export function getMemberDepartments(
  db: TVCExclusiveDatabaseSchema,
  memberId: string
): DepartmentRecord[] {
  const deptIds = new Set(
    db.member_departments
      .filter((md) => md.member_id === memberId)
      .map((md) => md.department_id)
  );
  return db.departments.filter((d) => deptIds.has(d.id));
}

export function toPublicMemberView(
  db: TVCExclusiveDatabaseSchema,
  member: MemberRecord
): PublicMemberView {
  const pos = db.positions.find((p) => p.id === member.position_id);
  const departments = getMemberDepartments(db, member.id);
  const permissions = getMemberPermissions(db, member);

  return {
    id: member.id,
    name: member.name,
    roll_number: member.roll_number,
    username: member.username,
    email: member.email,
    phone: member.phone,
    level: member.level,
    academic_year: member.academic_year,
    position_id: member.position_id,
    position_name: pos?.name || "Member",
    position_slug: pos?.slug || "member",
    membership_status: member.membership_status,
    profile_image: member.profile_image,
    bio: member.bio,
    skills: member.skills,
    interests: member.interests,
    linkedin: member.linkedin,
    must_change_password: member.must_change_password,
    notification_preferences: member.notification_preferences || {
      ...DEFAULT_NOTIFICATION_PREFS,
    },
    departments,
    permissions,
    joined_at: member.joined_at,
    // UI aliases
    fullName: member.name,
    rollNumber: member.roll_number,
    positionTitle: pos?.name || "Member",
    positionKey: pos?.slug || "member",
    accountStatus: member.membership_status,
    mustChangePassword: member.must_change_password,
    socialLinks: {
      linkedin: member.linkedin,
    },
  };
}

/**
 * Checks whether a member is authorised to view/access a conversation
 */
export function canAccessConversation(
  db: TVCExclusiveDatabaseSchema,
  member: MemberRecord,
  conversationId: string
): boolean {
  if (member.membership_status !== "active") return false;
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (!conv) return false;

  if (conv.type === "announcement") {
    return true; // All active members can view General Announcements
  }
  if (conv.type === "level" || (conv.type as string) === "level_community") {
    // Strictly enforce current organisational level!
    const targetLvl = conv.level ?? (conv as any).target_level;
    return targetLvl === member.level;
  }
  if (conv.type === "department" || (conv.type as string) === "department_community") {
    // Strictly enforce current department membership!
    // Level 3 Executive Board members have cross-department oversight
    const isExecutive = member.level === 3;
    const isAssigned = db.member_departments.some(
      (md) =>
        md.member_id === member.id && md.department_id === conv.department_id
    );
    return isExecutive || isAssigned;
  }
  if (conv.type === "direct") {
    return Boolean(conv.participant_ids?.includes(member.id));
  }
  return false;
}

/**
 * Checks whether a member is authorised to post messages in a conversation
 */
export function canPostInConversation(
  db: TVCExclusiveDatabaseSchema,
  member: MemberRecord,
  conversationId: string
): boolean {
  if (!canAccessConversation(db, member, conversationId)) return false;
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (!conv) return false;

  if (conv.type === "announcement") {
    // Only Level 3 with publish_general_announcements permission can post here
    return (
      member.level === 3 &&
      hasPermission(db, member, "publish_general_announcements")
    );
  }
  return true;
}

/**
 * Creates a persistent notification and dispatches real-time + push events
 */
export function createNotification(
  db: TVCExclusiveDatabaseSchema,
  params: {
    recipient_id: string;
    type: NotificationType;
    title: string;
    body: string;
    reference_type: NotificationRecord["reference_type"];
    reference_id: string;
    deep_link: string;
  }
): NotificationRecord | null {
  const recipient = db.members.find((m) => m.id === params.recipient_id);
  if (!recipient || recipient.membership_status !== "active") return null;

  // Deduplicate identical unread notification within 15 seconds
  const duplicate = db.notifications.find(
    (n) =>
      n.recipient_id === params.recipient_id &&
      n.type === params.type &&
      n.reference_id === params.reference_id &&
      n.title === params.title &&
      !n.is_read &&
      Date.now() - new Date(n.created_at).getTime() < 15000
  );
  if (duplicate) return duplicate;

  const notif: NotificationRecord = {
    id: `notif-${generateSecureToken(8)}`,
    recipient_id: params.recipient_id,
    type: params.type,
    title: params.title,
    body: params.body,
    reference_type: params.reference_type,
    reference_id: params.reference_id,
    deep_link: params.deep_link,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  db.notifications.unshift(notif);

  realtimeHub.publish({
    id: notif.id,
    type: "notification_created",
    recipient_ids: [params.recipient_id],
    data: notif,
    timestamp: notif.created_at,
  });

  // Dispatch Expo push notification asynchronously if device tokens exist for recipient
  const tokens = db.device_tokens.filter(
    (dt) => dt.member_id === params.recipient_id
  );
  if (tokens.length > 0 && recipient.notification_preferences?.push_enabled !== false) {
    dispatchExpoPushNotifications(
      tokens.map((t) => t.device_token),
      notif.title,
      notif.body,
      { deep_link: notif.deep_link, reference_id: notif.reference_id }
    ).catch(() => {
      // Non-blocking push dispatch
    });
  }

  return notif;
}

async function dispatchExpoPushNotifications(
  expoPushTokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown>
) {
  const validTokens = expoPushTokens.filter(
    (t) => t.startsWith("ExponentPushToken[") || t.startsWith("ExpoPushToken[")
  );
  if (validTokens.length === 0) return;

  const messages = validTokens.map((to) => ({
    to,
    sound: "default",
    title,
    body,
    data,
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });
}

export function recordAuditLog(
  db: TVCExclusiveDatabaseSchema,
  params: {
    actor_id: string;
    action: string;
    target_type: string;
    target_id: string;
    summary: string;
    metadata?: Record<string, unknown>;
  }
) {
  db.audit_logs.unshift({
    id: `audit-${generateSecureToken(8)}`,
    actor_id: params.actor_id,
    action: params.action,
    target_type: params.target_type,
    target_id: params.target_id,
    summary: params.summary,
    metadata: params.metadata || {},
    created_at: new Date().toISOString(),
  });
}

export { generateProvisionedPassword, DEFAULT_NOTIFICATION_PREFS };

