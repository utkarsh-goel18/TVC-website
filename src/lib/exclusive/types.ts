export type OrganisationalLevel = 1 | 2 | 3;

export type MembershipStatus = "active" | "inactive" | "suspended";

export type PermissionKey =
  | "approve_level_2_applications"
  | "approve_level_1_applications"
  | "promote_core_members"
  | "create_level_2_tasks"
  | "create_level_1_tasks"
  | "manage_departments"
  | "manage_positions"
  | "manage_members"
  | "manage_permissions"
  | "publish_general_announcements"
  | "view_audit_logs";

export interface PositionRecord {
  id: string;
  name: string;
  slug: string;
  organisational_level: OrganisationalLevel;
  description: string;
  is_active: boolean;
  created_at: string;
  // UI aliases
  title?: string;
  key?: string;
  level?: OrganisationalLevel;
  permissions?: PermissionKey[];
}

export interface PermissionRecord {
  id: string;
  key: PermissionKey;
  description: string;
}

export interface PositionPermissionRecord {
  position_id: string;
  permission_id: string;
}

export interface MemberPermissionRecord {
  member_id: string;
  permission_id: string;
  granted_by: string;
  created_at: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent_color: string;
  created_at: string;
  // UI helpers
  members?: PublicMemberView[];
  memberCount?: number;
}

export interface MemberDepartmentRecord {
  member_id: string;
  department_id: string;
  assigned_by: string;
  assigned_at: string;
}

export interface NotificationPreferences {
  direct_messages: boolean;
  group_messages: boolean;
  announcements: boolean;
  task_updates: boolean;
  applications: boolean;
  promotions: boolean;
  deadlines: boolean;
  push_enabled: boolean;
  muted_conversations: string[];
}

export interface MemberRecord {
  id: string;
  name: string;
  roll_number: string;
  username: string;
  email: string;
  phone: string;
  level: OrganisationalLevel;
  academic_year: string;
  position_id: string;
  membership_status: MembershipStatus;
  profile_image?: string;
  bio: string;
  skills: string[];
  interests: string[];
  linkedin?: string;
  password_hash: string;
  must_change_password: boolean;
  notification_preferences: NotificationPreferences;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicMemberView {
  id: string;
  name: string;
  roll_number: string;
  username: string;
  email: string;
  phone: string;
  level: OrganisationalLevel;
  academic_year: string;
  position_id: string;
  position_name: string;
  position_slug: string;
  membership_status: MembershipStatus;
  profile_image?: string;
  bio: string;
  skills: string[];
  interests: string[];
  linkedin?: string;
  must_change_password: boolean;
  notification_preferences: NotificationPreferences;
  departments: DepartmentRecord[];
  permissions: PermissionKey[];
  joined_at: string;
  // UI aliases
  fullName: string;
  rollNumber: string;
  positionTitle: string;
  positionKey?: string;
  accountStatus: MembershipStatus;
  mustChangePassword?: boolean;
  socialLinks?: {
    linkedin?: string;
    github?: string;
  };
}

export interface SessionRecord {
  token: string;
  member_id: string;
  created_at: string;
  expires_at: string;
}

export interface PasswordResetTokenRecord {
  token: string;
  member_id: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

export interface MemberPositionHistoryRecord {
  id: string;
  member_id: string;
  previous_position_id: string;
  new_position_id: string;
  previous_level: OrganisationalLevel;
  new_level: OrganisationalLevel;
  reason: string;
  changed_by: string;
  changed_at: string;
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface MembershipApplicationRecord {
  id: string;
  full_name: string;
  roll_number: string;
  email: string;
  phone: string;
  academic_year: string;
  requested_level: 1 | 2;
  department_interests: string[];
  skills: string[];
  previous_experience: string;
  motivation: string;
  additional_info: string;
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_comments?: string;
  rejection_reason?: string;
  provisioned_member_id?: string;
  initial_password_hint?: string;
  // UI aliases
  fullName?: string;
  rollNumber?: string;
  universityEmail?: string;
  targetLevel?: number;
  departmentInterests?: string[];
  createdAt?: string;
  reviewNotes?: string;
  reviewedByName?: string;
}

export interface ApplicationReviewRecord {
  id: string;
  application_id: string;
  reviewer_id: string;
  decision: "accepted" | "rejected";
  comments: string;
  rejection_reason?: string;
  created_at: string;
}

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskAssignmentMode =
  | "individual"
  | "multiple"
  | "department"
  | "everyone"
  | "random"
  | "open_pool";

export type RandomDistributionMode = "pure" | "balanced" | "department";

export type TaskStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export interface OpenPoolConfig {
  eligible_levels: (1 | 2 | 3)[];
  eligible_department_ids: string[];
  max_slots: number;
  claimed_member_ids: string[];
  claim_deadline: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  instructions: string;
  expected_deliverables: string;
  reference_links: string[];
  created_by: string;
  parent_task_id?: string;
  department_id?: string;
  priority: TaskPriority;
  deadline: string;
  assignment_mode: TaskAssignmentMode;
  random_distribution_mode?: RandomDistributionMode;
  open_pool_config?: OpenPoolConfig;
  status: TaskStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignmentRecord {
  id: string;
  task_id: string;
  member_id: string;
  status: TaskStatus;
  progress: number;
  submission_notes?: string;
  submission_links: string[];
  review_feedback?: string;
  accepted_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface TaskCommentRecord {
  id: string;
  task_id: string;
  member_id: string;
  content: string;
  created_at: string;
}

export interface TaskAttachmentRecord {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

export interface TaskActivityRecord {
  id: string;
  task_id: string;
  actor_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ConversationType =
  | "announcement"
  | "level"
  | "department"
  | "direct";

export interface ConversationRecord {
  id: string;
  type: ConversationType;
  title: string;
  subtitle: string;
  department_id?: string;
  level?: OrganisationalLevel;
  participant_ids?: string[];
  created_at: string;
}

export interface ConversationMemberRecord {
  conversation_id: string;
  member_id: string;
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
}

export interface EncryptedMessagePayload {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: "AES-256-GCM";
  key_fingerprint: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_encrypted?: boolean;
  encrypted_payload?: EncryptedMessagePayload;
  attachment_path?: string;
  attachment_name?: string;
  links: string[];
  is_pinned: boolean;
  read_by: string[];
  created_at: string;
  edited_at?: string;
}

export type NotificationType =
  | "direct_message"
  | "group_message"
  | "announcement"
  | "task_assigned"
  | "task_claimed"
  | "task_submitted"
  | "task_approved"
  | "revision_requested"
  | "application_accepted"
  | "application_rejected"
  | "core_promotion"
  | "department_change"
  | "deadline_approaching";

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  body: string;
  reference_type: "task" | "conversation" | "application" | "member" | "department";
  reference_id: string;
  deep_link: string;
  is_read: boolean;
  created_at: string;
  // UI aliases
  actionUrl?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface DeviceTokenRecord {
  id: string;
  member_id: string;
  device_token: string;
  platform: "ios" | "android" | "web";
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // UI aliases
  actorId?: string;
  actorName?: string;
  actorLevel?: number;
  targetType?: string;
  targetId?: string;
  createdAt?: string;
}

export interface TVCExclusiveDatabaseSchema {
  positions: PositionRecord[];
  permissions: PermissionRecord[];
  position_permissions: PositionPermissionRecord[];
  members: MemberRecord[];
  member_permissions: MemberPermissionRecord[];
  sessions: SessionRecord[];
  password_reset_tokens: PasswordResetTokenRecord[];
  departments: DepartmentRecord[];
  member_departments: MemberDepartmentRecord[];
  member_position_history: MemberPositionHistoryRecord[];
  membership_applications: MembershipApplicationRecord[];
  application_reviews: ApplicationReviewRecord[];
  tasks: TaskRecord[];
  task_assignments: TaskAssignmentRecord[];
  task_comments: TaskCommentRecord[];
  task_attachments: TaskAttachmentRecord[];
  task_activity: TaskActivityRecord[];
  conversations: ConversationRecord[];
  conversation_members: ConversationMemberRecord[];
  messages: MessageRecord[];
  notifications: NotificationRecord[];
  device_tokens: DeviceTokenRecord[];
  audit_logs: AuditLogRecord[];
}

export type SafeMemberProfile = PublicMemberView;
export type MembershipApplicationItem = MembershipApplicationRecord;
export type NotificationItem = NotificationRecord;
export type MessageItem = MessageRecord & {
  senderId?: string;
  senderName?: string;
  sender_name?: string;
  senderLevel?: number;
  sender_level?: number;
  senderPositionTitle?: string;
  sender_position?: string;
  replyToId?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  isPinned?: boolean;
  createdAt?: string;
  is_encrypted?: boolean;
  encrypted_payload?: EncryptedMessagePayload;
  decrypted_content?: string;
};

