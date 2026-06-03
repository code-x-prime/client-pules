"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { AddClientDialog } from "@/components/add-client-dialog";
import { QuickAddClientCard } from "@/components/quick-add-client-card";
import { DashboardClientCard } from "@/components/dashboard-client-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalClients: number;
  dueThisWeek: number;
  deployingSoon: number;
  averageProgress: number;
  clientsGrowth: number;
  clientsLast30Days: number;
  overdueClients: number;
  totalDeployed: number;
  completedClients: number;
}

interface Client {
  id: string;
  name: string;
  projectTitle: string;
  phone: string;
  email: string | null;
  createdAt: string;
  dueDate: string | null;
  deploymentDate: string | null;
  progress: number;
  status: "not_started" | "in_progress" | "ready" | "delayed" | "deployed";
  _count?: {
    notes: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, clientsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/clients?limit=10&sortBy=createdAt&sortOrder=desc"),
      ]);

      if (!statsRes.ok || !clientsRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const statsData = await statsRes.json();
      const clientsData = await clientsRes.json();

      setStats(statsData);
      setRecentClients(clientsData.clients);
    } catch (error) {
      console.error("Dashboard Data Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <Topbar
        title="Dashboard"
        actions={<AddClientDialog onSuccess={fetchData} />}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Stat 1: Total Clients */}
          <Card className="border border-gray-200 shadow-sm p-5 bg-white hover:shadow-md transition-all duration-200 rounded-xl">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Clients
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-12 rounded-full" />
                ) : (
                  <span className={cn(
                    "border px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shrink-0",
                    (stats?.clientsGrowth ?? 0) >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                  )}>
                    {(stats?.clientsGrowth ?? 0) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{Math.abs(stats?.clientsGrowth ?? 0).toFixed(0)}% MoM</span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {loading ? <Skeleton className="h-9 w-16" /> : stats?.totalClients || 0}
                </h3>
              </div>
              <div className="space-y-0.5 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-0.5 text-xs font-bold text-gray-900">
                  <span>MoM growth rate</span>
                  {(stats?.clientsGrowth ?? 0) >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {loading ? <Skeleton className="h-3.5 w-24" /> : `${stats?.clientsLast30Days || 0} registered last 30d`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat 2: Due This Week */}
          <Card className="border border-gray-200 shadow-sm p-5 bg-white hover:shadow-md transition-all duration-200 rounded-xl">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                  Due This Week
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-12 rounded-full" />
                ) : (
                  <span className={cn(
                    "border px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shrink-0",
                    (stats?.overdueClients ?? 0) > 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-zinc-50 text-zinc-700 border-zinc-200"
                  )}>
                    <span>{stats?.overdueClients || 0} Overdue</span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {loading ? <Skeleton className="h-9 w-16" /> : stats?.dueThisWeek || 0}
                </h3>
              </div>
              <div className="space-y-0.5 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-0.5 text-xs font-bold text-gray-900">
                  <span>Overdue milestones</span>
                  {(stats?.overdueClients ?? 0) > 0 ? (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {loading ? <Skeleton className="h-3.5 w-24" /> : `${stats?.overdueClients || 0} clients behind schedule`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat 3: Deploying Soon */}
          <Card className="border border-gray-200 shadow-sm p-5 bg-white hover:shadow-md transition-all duration-200 rounded-xl">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                  Deploying Soon
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-12 rounded-full" />
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                    <span>{stats?.totalDeployed || 0} Live</span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {loading ? <Skeleton className="h-9 w-16" /> : stats?.deployingSoon || 0}
                </h3>
              </div>
              <div className="space-y-0.5 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-0.5 text-xs font-bold text-gray-900">
                  <span>Completed deployments</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {loading ? <Skeleton className="h-3.5 w-24" /> : `${stats?.totalDeployed || 0} projects deployed live`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat 4: Avg Progress */}
          <Card className="border border-gray-200 shadow-sm p-5 bg-white hover:shadow-md transition-all duration-200 rounded-xl">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                  Avg. Progress
                </span>
                {loading ? (
                  <Skeleton className="h-5 w-12 rounded-full" />
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                    <span>{stats?.completedClients || 0} Ready</span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    `${stats?.averageProgress || 0}%`
                  )}
                </h3>
              </div>
              <div className="space-y-0.5 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-0.5 text-xs font-bold text-gray-900">
                  <span>Completion efficiency</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {loading ? <Skeleton className="h-3.5 w-24" /> : `${stats?.completedClients || 0} projects fully completed`}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clients Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Clients</h2>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-primary border-primary/20 hover:bg-primary/10 font-semibold"
            >
              <Link href="/clients" className="flex items-center gap-1">
                <span>View All Clients</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Quick Add Client Card (always first) */}
            <QuickAddClientCard onSuccess={fetchData} />

            {/* Skeletons while loading */}
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="border border-gray-200 shadow-sm rounded-xl p-5 bg-white space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-9 w-full rounded" />
                  <Skeleton className="h-9 w-full rounded" />
                  <Skeleton className="h-14 w-full rounded" />
                </Card>
              ))
            ) : recentClients.length === 0 ? (
              <Card className="border border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 flex items-center justify-center min-h-[300px] col-span-full sm:col-span-1 lg:col-span-2 xl:col-span-3">
                <p className="text-sm text-gray-500 font-medium">No other clients registered yet.</p>
              </Card>
            ) : (
              recentClients.map((client) => (
                <DashboardClientCard
                  key={client.id}
                  client={client}
                  onRefresh={fetchData}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
