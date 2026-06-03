"use client";

import React from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-16 border-b border-gray-200 bg-white px-4 md:px-6 w-full shrink-0">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-gray-200 hover:bg-gray-50 h-10 w-10 shrink-0"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[220px] bg-sidebar border-r border-sidebar-border">
            <Sidebar className="w-full border-none" />
          </SheetContent>
        </Sheet>
        
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Action buttons (e.g. Add Client) */}
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
}
