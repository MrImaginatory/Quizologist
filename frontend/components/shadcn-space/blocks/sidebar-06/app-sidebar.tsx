"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { NavItem, NavMain } from "@/components/shadcn-space/blocks/sidebar-06/nav-main";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LogOut,
  FileQuestion,
  GraduationCap,
  UserCheck,
  UserCog,
  BookOpen,
  Bookmark,
  Upload,
  MapPin,
} from "lucide-react";

const studentNav: NavItem[] = [
  { label: "Main", isSection: true },
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "My Enrollments", icon: GraduationCap, href: "/dashboard/enrollments" },
  { title: "My Tests", icon: ClipboardList, href: "/dashboard/my-tests" },
  { label: "Account", isSection: true },
  { title: "Profile", icon: Users, href: "/dashboard/profile" },
];

const teacherNav: NavItem[] = [
  { label: "Main", isSection: true },
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Manage Tests", icon: ClipboardList, href: "/dashboard/tests" },
  { title: "Question Bank", icon: FileQuestion, href: "/dashboard/questions" },
  { label: "Management", isSection: true },
  { title: "Students", icon: Users, href: "/dashboard/students" },
  { title: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
];

const adminNav: NavItem[] = [
  { label: "Main", isSection: true },
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Management", isSection: true },
  {
    title: "Users",
    icon: Users,
    children: [
      { title: "All Users", icon: Users, href: "/dashboard/users" },
      { title: "Students", icon: UserCheck, href: "/dashboard/users/students" },
      { title: "Teachers", icon: UserCog, href: "/dashboard/users/teachers" },
    ],
  },
  {
    title: "Courses",
    icon: GraduationCap,
    children: [
      { title: "Courses", icon: GraduationCap, href: "/dashboard/courses" },
      { title: "Subjects", icon: BookOpen, href: "/dashboard/subjects" },
      { title: "Topics", icon: Bookmark, href: "/dashboard/topics" },
    ],
  },
  {
    title: "Questions",
    icon: FileQuestion,
    children: [
      { title: "All Questions", icon: FileQuestion, href: "/dashboard/questions" },
      { title: "Import Excel", icon: Upload, href: "/dashboard/questions/import" },
    ],
  },
  { title: "Tests", icon: ClipboardList, href: "/dashboard/tests" },
  { title: "Locations", icon: MapPin, href: "/dashboard/locations" },
];

export function AppSidebar() {
  const { user, logout } = useAuth();

  const navItems = user?.role === "admin"
    ? adminNav
    : user?.role === "teacher"
      ? teacherNav
      : studentNav;

  return (
    <Sidebar variant="floating" className="p-4 h-full [&_[data-slot=sidebar-inner]]:h-full">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <SidebarHeader className="px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <AppLogo size="md" showName={true} />
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-4">
              <NavMain items={navItems} />
            </div>
          </ScrollArea>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="px-4 pb-4">
          <div className="px-4 py-3 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {capitalize(user?.fname || "")} {capitalize(user?.lname || "")}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 shrink-0 cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
