"use client";

import React, { Suspense } from "react";
import { Topbar } from "@/components/topbar";
import { ClientTable } from "@/components/client-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

function ClientTableFallback() {
  return (
    <div className="w-full space-y-6">
      {/* Filter placeholder skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:max-w-xs">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Cards Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx} className="border border-gray-200 shadow-sm rounded-xl p-5 bg-white space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-full rounded" />
            <Skeleton className="h-9 w-full rounded" />
            <Skeleton className="h-14 w-full rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <Topbar title="Clients" />

      {/* Main Table Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Suspense fallback={<ClientTableFallback />}>
          <ClientTable />
        </Suspense>
      </main>
    </div>
  );
}
