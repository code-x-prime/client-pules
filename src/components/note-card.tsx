"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Pencil, Check, X, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface NoteCardProps {
  note: Note;
  onUpdate: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error("Failed to update note");
      
      toast.success("Note updated");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Could not update note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      toast.success("Note deleted");
      onDelete();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-150 shadow-sm relative group bg-white hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px] border-primary/30 focus-visible:ring-primary"
                  disabled={loading}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(note.content);
                    }}
                    disabled={loading}
                    className="border-gray-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {note.client && (
                  <div className="mb-2">
                    <Link
                      href={`/clients/${note.client.id}`}
                      className="text-xs font-extrabold text-primary hover:underline hover:text-primary/80"
                    >
                      {note.client.name} &bull; {note.client.projectTitle}
                    </Link>
                  </div>
                )}
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {note.content}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{formatDate(note.createdAt)}</span>
                  {note.createdAt !== note.updatedAt && (
                    <span className="text-gray-300 italic">(edited)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (only visible in non-edit mode) */}
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={loading}
                title="Edit note"
                className="h-8 w-8 border-gray-200 text-gray-500 hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={loading}
                    title="Delete note"
                    className="h-8 w-8 border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete this note. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
