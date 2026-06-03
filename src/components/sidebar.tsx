"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarClock,
  Rocket,
  BarChart3,
  Settings,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const userName = user?.name || "Admin User";
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const sections = [
    {
      title: "Home",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
        },
        {
          label: "Clients",
          icon: Users,
          href: "/clients",
        },
        {
          label: "Settings",
          icon: Settings,
          href: "/settings",
        },
      ],
    },
    {
      title: "Documents",
      items: [
        {
          label: "Notes",
          icon: FileText,
          href: "/notes",
        },
        {
          label: "Due Dates",
          icon: CalendarClock,
          href: "/clients?sortBy=dueDate&sortOrder=asc",
        },
        {
          label: "Deployments",
          icon: Rocket,
          href: "/clients?status=ready",
        },
        {
          label: "Progress",
          icon: BarChart3,
          href: "/clients?sortBy=progress&sortOrder=desc",
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[220px]",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-center min-h-16 shrink-0">
        {isCollapsed ? (
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg border border-sidebar-border bg-card shadow-sm hover:bg-sidebar-accent transition-colors"
          >
            <Rocket className="h-5 w-5 text-primary shrink-0 animate-pulse" />
          </Link>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-lg border border-sidebar-border bg-card shadow-sm hover:bg-sidebar-accent/50 transition-colors w-full cursor-pointer">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Rocket className="h-4.5 w-4.5 shrink-0 animate-pulse" />
              </div>
              <span className="font-bold tracking-tight">ClientPulse Inc.</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-sidebar-border shrink-0", isCollapsed ? "justify-center" : "")}>
        <Avatar className="h-9 w-9 border border-sidebar-border">
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-bold border border-sidebar-border">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate leading-none mb-1 text-foreground">{userName}</span>
            <span className="text-xs text-muted-foreground truncate capitalize leading-none font-medium">
              {(user as { role?: string })?.role || "Admin"}
            </span>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest px-3 mb-2 uppercase block">
                {section.title}
              </span>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group relative",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-slate-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center gap-3 bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border hover:border-sidebar-border py-2",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
