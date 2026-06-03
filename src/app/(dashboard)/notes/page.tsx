"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FileText, Search, RefreshCw } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { NoteCard } from "@/components/note-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    projectTitle: string;
  };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = async (query: string = "") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const resData = await response.json();
      setNotes(resData.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load project log notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 450);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
      <Topbar title="Project Notes Feed" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Search Bar Panel */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
            <Input
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search notes by content, client name, or project title..."
              className="pl-10 h-10 w-full border-gray-200 focus-visible:ring-primary text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchNotes(searchQuery)}
            title="Refresh Notes"
            className="h-10 w-10 border-gray-200"
          >
            <RefreshCw className="h-4.5 w-4.5 text-gray-500" />
          </Button>
        </div>

        {/* Notes Grid List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Chronological Updates Feed ({notes.length})</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="border border-gray-205 shadow-sm rounded-xl p-5 bg-white space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4.5 w-48" />
                    <Skeleton className="h-4.5 w-24 animate-pulse" />
                  </div>
                  <Skeleton className="h-12 w-full rounded" />
                </Card>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <Card className="border border-dashed border-gray-200 rounded-xl p-10 bg-white flex flex-col items-center justify-center min-h-[250px] shadow-sm">
              <FileText className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-semibold">No notes found matching search query.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={() => fetchNotes(searchQuery)}
                  onDelete={() => fetchNotes(searchQuery)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
