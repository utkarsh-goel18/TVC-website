"use client";

import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  User,
  CheckSquare,
  MessageSquare,
  Users,
  Building,
  FileCheck,
  ShieldAlert,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import type { SafeMemberProfile } from "@/lib/exclusive/types";
import { DashboardModule } from "./modules/dashboard-module";
import { TasksModule } from "./modules/tasks-module";
import { ConnectModule } from "./modules/connect-module";
import { DirectoryModule } from "./modules/directory-module";
import { DepartmentsModule } from "./modules/departments-module";
import { ProfileModule } from "./modules/profile-module";
import { ApplicationsModule } from "./modules/applications-module";
import { AdminModule } from "./modules/admin-module";
import { NotificationsModule } from "./modules/notifications-module";
import { SettingsModule } from "./modules/settings-module";

interface TvcExclusivePortalProps {
  member: SafeMemberProfile;
  onLogout: () => void;
  onSwitchFixture?: (rollNumber: string) => void;
}

export function TvcExclusivePortal({
  member,
  onLogout,
  onSwitchFixture,
}: TvcExclusivePortalProps) {
  const [currentModule, setCurrentModule] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [directPeerId, setDirectPeerId] = useState<string | null>(null);
  const [realtimeSignal, setRealtimeSignal] = useState(0);

  // Profile local state
  const [currentMemberProfile, setCurrentMemberProfile] =
    useState<SafeMemberProfile>(member);

  // Setup Server-Sent Events (SSE)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/exclusive/connect/stream");
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.type !== "ping") {
            setRealtimeSignal((prev) => prev + 1);
            if (data.type === "notification") {
              setUnreadCount((prev) => prev + 1);
            }
          }
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        // SSE reconnect handles itself
      };
    } catch {
      // Fallback
    }

    // Also fetch initial unread notification count
    (async () => {
      try {
        const res = await fetch("/api/exclusive/notifications");
        const json = await res.json();
        if (res.ok && json.notifications) {
          const unread = json.notifications.filter(
            (n: { isRead: boolean }) => !n.isRead
          ).length;
          setUnreadCount(unread);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [member.id]);

  const canAccessApplications =
    currentMemberProfile.level === 3 ||
    currentMemberProfile.level === 2 ||
    currentMemberProfile.permissions.includes("approve_level_1_applications") ||
    currentMemberProfile.permissions.includes("approve_level_2_applications");

  const canAccessAdmin =
    currentMemberProfile.level === 3 ||
    currentMemberProfile.permissions.includes("promote_core_members") ||
    currentMemberProfile.permissions.includes("manage_positions") ||
    currentMemberProfile.permissions.includes("manage_members") ||
    currentMemberProfile.permissions.includes("view_audit_logs");

  // Navigation Items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      visible: true,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      visible: true,
    },
    {
      id: "connect",
      label: "Connect",
      icon: MessageSquare,
      visible: true,
    },
    {
      id: "directory",
      label: "Member Directory",
      icon: Users,
      visible: true,
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building,
      visible: true,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileCheck,
      visible: canAccessApplications,
    },
    {
      id: "admin",
      label: "Administration",
      icon: ShieldAlert,
      visible: canAccessAdmin,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      visible: true,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: Settings,
      visible: true,
    },
  ];

  const handleStartDirectMessage = (peerId: string) => {
    setDirectPeerId(peerId);
    setCurrentModule("connect");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090e]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 font-display text-sm font-black text-slate-950 shadow-md">
                TVC
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-sm font-bold tracking-tight text-white">
                    TVC Exclusive
                  </span>
                  <span className="hidden rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.2 text-[9px] font-bold text-amber-300 sm:inline-block">
                    PRIVATE WORKSPACE
                  </span>
                </div>
                <p className="hidden text-[10px] text-white/50 sm:block">
                  Thapar Venture Club Member Ecosystem
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Fixture Switcher (for evaluators) */}
            {onSwitchFixture && (
              <div className="hidden sm:block">
                <select
                  value={currentMemberProfile.rollNumber}
                  onChange={(e) => onSwitchFixture(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/80 focus:border-amber-400 focus:outline-none"
                  title="Switch test role fixture"
                >
                  <option value="102203000">L3: President (102203000)</option>
                  <option value="102203001">L3: Gen Sec (102203001)</option>
                  <option value="102203004">L3: Joint Sec (102203004)</option>
                  <option value="102203014">L3: Design Sec (102203014)</option>
                  <option value="102203013">L3: Tech Sec (102203013)</option>
                  <option value="102303101">L2: Core Member (102303101)</option>
                  <option value="102303102">L2: General Member (102303102)</option>
                  <option value="102403201">L1: General Member (102403201)</option>
                </select>
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setCurrentModule("notifications")}
              className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/70 hover:bg-white/10 hover:text-white"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 font-sans text-[9px] font-bold text-slate-950">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Member Profile Quick Badge */}
            <button
              onClick={() => setCurrentModule("profile")}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 pr-3 text-left transition hover:border-amber-400/40"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/20 text-xs font-bold text-amber-300">
                {currentMemberProfile.fullName[0]}
              </div>
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold text-white">
                  {currentMemberProfile.fullName}
                </div>
                <div className="text-[10px] text-white/50">
                  L{currentMemberProfile.level} · {currentMemberProfile.positionTitle}
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="hidden rounded-xl border border-white/10 p-2 text-white/50 hover:bg-rose-500/10 hover:text-rose-300 lg:block"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Desktop Left Sidebar Navigation */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
              {/* Member Card */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/15 font-display text-sm font-bold text-amber-300">
                    {currentMemberProfile.fullName
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">
                      {currentMemberProfile.fullName}
                    </p>
                    <p className="truncate text-[11px] text-white/50">
                      {currentMemberProfile.positionTitle}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.2 text-[9px] font-bold ${
                        currentMemberProfile.level === 3
                          ? "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : currentMemberProfile.level === 2
                          ? "border border-sky-400/30 bg-sky-400/10 text-sky-300"
                          : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      Organisational Level {currentMemberProfile.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Nav Links */}
              <nav className="mt-4 space-y-1">
                {navItems
                  .filter((item) => item.visible)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentModule(item.id)}
                        className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition ${
                          isActive
                            ? "bg-amber-400 text-slate-950 shadow-md"
                            : "text-white/65 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? "bg-slate-950 text-amber-300"
                                : "bg-amber-400 text-slate-950"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </nav>

              <div className="mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-medium text-white/50 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Slide-Out Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md lg:hidden">
              <div className="w-4/5 max-w-xs border-r border-white/10 bg-[#07090e] p-5 shadow-2xl">
                <div className="flex items-center justify-between pb-4">
                  <span className="font-display text-sm font-bold text-white">
                    TVC Exclusive Modules
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-white/10 p-1 text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems
                    .filter((item) => item.visible)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = currentModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentModule(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                            isActive
                              ? "bg-amber-400 text-slate-950"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
              <div
                className="flex-1"
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>
          )}

          {/* Main Module Content Area */}
          <main className="lg:col-span-9">
            {currentModule === "dashboard" && (
              <DashboardModule
                member={currentMemberProfile}
                onNavigate={(mod) => setCurrentModule(mod)}
              />
            )}

            {currentModule === "profile" && (
              <ProfileModule
                member={currentMemberProfile}
                onProfileUpdated={setCurrentMemberProfile}
              />
            )}

            {currentModule === "tasks" && (
              <TasksModule member={currentMemberProfile} />
            )}

            {currentModule === "connect" && (
              <ConnectModule
                member={currentMemberProfile}
                initialPeerId={directPeerId}
                onClearInitialPeer={() => setDirectPeerId(null)}
                realtimeSignal={realtimeSignal}
              />
            )}

            {currentModule === "directory" && (
              <DirectoryModule
                currentMember={currentMemberProfile}
                onStartDirectMessage={handleStartDirectMessage}
              />
            )}

            {currentModule === "departments" && (
              <DepartmentsModule member={currentMemberProfile} />
            )}

            {currentModule === "applications" && canAccessApplications && (
              <ApplicationsModule member={currentMemberProfile} />
            )}

            {currentModule === "admin" && canAccessAdmin && (
              <AdminModule currentMember={currentMemberProfile} />
            )}

            {currentModule === "notifications" && (
              <NotificationsModule
                member={currentMemberProfile}
                onNavigateToModule={setCurrentModule}
                realtimeSignal={realtimeSignal}
              />
            )}

            {currentModule === "settings" && (
              <SettingsModule
                member={currentMemberProfile}
                onLogout={onLogout}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar: Home | Tasks | Connect | Members | Profile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#07090e]/95 px-3 py-2 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around">
          {(
            [
              { id: "dashboard", label: "Home", icon: LayoutDashboard },
              { id: "tasks", label: "Tasks", icon: CheckSquare },
              { id: "connect", label: "Connect", icon: MessageSquare },
              { id: "directory", label: "Members", icon: Users },
              { id: "profile", label: "Profile", icon: User },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isActive = currentModule === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setCurrentModule(t.id)}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 transition ${
                  isActive ? "text-amber-300" : "text-white/45 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
