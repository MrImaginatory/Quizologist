"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shadcn-space/blocks/sidebar-06/app-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalize } from "@/lib/utils";

function LiveDateTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
      <span>{date}</span>
      <span className="text-border">|</span>
      <span className="font-mono">{time}</span>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.fname?.charAt(0) || ""}${user.lname?.charAt(0) || ""}`.toUpperCase()
    : "?";

  return (
    <SidebarProvider style={{ "--sidebar-width": "300px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="cursor-pointer" aria-label="Toggle sidebar" />
          </div>
          <LiveDateTime />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none" aria-label="User menu">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {capitalize(user?.fname || "")} {capitalize(user?.lname || "")}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
