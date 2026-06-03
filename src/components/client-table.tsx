"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardClientCard } from "@/components/dashboard-client-card";
import { AddClientDialog } from "./add-client-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
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
  notes?: Note[];
  _count?: {
    notes: number;
  };
}

export function ClientTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load state from URL parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "all";
  const searchVal = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Local search state for input (real-time filtering triggers URL update)
  const [searchQuery, setSearchQuery] = useState(searchVal);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load clients whenever searchParams change
  const fetchClients = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "30",
        search: searchVal,
        status,
        sortBy,
        sortOrder,
      });
      const response = await fetch(`/api/clients?${query.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Could not load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, searchVal, sortBy, sortOrder]);

  // Sync state if URL changes externally (e.g. sidebar navigation)
  useEffect(() => {
    setSearchQuery(searchVal);
  }, [searchVal]);

  const updateUrl = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    // Reset page if filtering/sorting/searching changes
    if (!newParams.page) {
      current.set("page", "1");
    }

    const searchStr = current.toString();
    router.push(`/clients${searchStr ? `?${searchStr}` : ""}`);
  };

  // Debounced search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateUrl({ search: value });
    }, 400); // 400ms delay
  };

  const handleStatusFilterChange = (value: string) => {
    updateUrl({ status: value });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateUrl({ page: newPage.toString() });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Filters & Add Client */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        {/* Left Filters */}
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name or phone..."
              className="pl-10 h-10 w-full border-gray-200"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="w-full sm:max-w-[180px]">
            <Select
              value={status}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="h-10 border-gray-200 bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="ready">Ready/Done</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By filter dropdown */}
          <div className="w-full sm:max-w-[180px]">
            <Select
              value={sortBy}
              onValueChange={(value) => updateUrl({ sortBy: value })}
            >
              <SelectTrigger className="h-10 border-gray-200 bg-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Client Name</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="deploymentDate">Deployment Date</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order filter dropdown */}
          <div className="w-full sm:max-w-[140px]">
            <Select
              value={sortOrder}
              onValueChange={(value) => updateUrl({ sortOrder: value })}
            >
              <SelectTrigger className="h-10 border-gray-200 bg-white">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchClients}
            title="Refresh"
            className="h-10 w-10 border-gray-200"
          >
            <RefreshCw className="h-4.5 w-4.5 text-gray-500" />
          </Button>

          <AddClientDialog onSuccess={fetchClients} />
        </div>
      </div>

      {/* Clients Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="border border-gray-200 shadow-sm rounded-xl p-5 bg-white space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-9 w-full rounded" />
              <Skeleton className="h-9 w-full rounded" />
              <Skeleton className="h-14 w-full rounded animate-pulse" />
            </Card>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Card className="border border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 flex items-center justify-center min-h-[250px]">
          <p className="text-sm text-gray-500 font-medium">No clients found. Click &quot;Add Client&quot; to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clients.map((client) => (
            <DashboardClientCard
              key={client.id}
              client={client}
              onRefresh={fetchClients}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-500 font-medium">
            Showing Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span> ({totalRecords} total clients)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="h-9 w-9 border-gray-200"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === page;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "outline"}
                  onClick={() => handlePageChange(p)}
                  className={`h-9 w-9 font-medium ${
                    isCurrent
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="h-9 w-9 border-gray-200"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
