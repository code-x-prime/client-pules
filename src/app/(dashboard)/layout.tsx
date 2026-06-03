import React from "react";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gray-50">
      {/* Desktop Sidebar - Left */}
      <Sidebar className="hidden md:flex shrink-0 h-full" />

      {/* Main Panel - Right */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}
