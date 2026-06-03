"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Phone,
  Calendar as CalendarIcon,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Eye,
} from "lucide-react";
import { clientSchema, noteSchema } from "@/lib/validations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { NoteCard } from "./note-card";

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

interface DashboardClientCardProps {
  client: Client;
  onRefresh: () => void;
}

type ClientFormValues = z.input<typeof clientSchema>;
type NoteFormValues = z.infer<typeof noteSchema>;

export function DashboardClientCard({ client, onRefresh }: DashboardClientCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>(client.notes || []);
  const [notesOpen, setNotesOpen] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [hasFetchedNotes, setHasFetchedNotes] = useState(false);

  // Local state for progress slider to render smoothly
  const [sliderProgress, setSliderProgress] = useState(client.progress);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize local progress state if prop changes
  useEffect(() => {
    setSliderProgress(client.progress);
  }, [client.progress]);

  // Synchronize local notes state if prop changes
  useEffect(() => {
    if (client.notes) {
      setNotes(client.notes);
    }
  }, [client.notes]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const editForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as unknown as Resolver<ClientFormValues>,
    defaultValues: {
      name: client.name,
      projectTitle: client.projectTitle || "",
      phone: client.phone,
      email: client.email || "",
      dueDate: client.dueDate ? new Date(client.dueDate).toISOString().split("T")[0] : "",
      deploymentDate: client.deploymentDate ? new Date(client.deploymentDate).toISOString().split("T")[0] : "",
      progress: client.progress,
      status: client.status,
    },
  });

  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleUpdate = async (values: ClientFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate || null,
          deploymentDate: values.deploymentDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update client");
      }

      toast.success("Client updated successfully");
      setIsEditing(false);
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: client.name,
          projectTitle: client.projectTitle,
          phone: client.phone,
          email: client.email || "",
          dueDate: client.dueDate,
          deploymentDate: client.deploymentDate,
          progress: client.progress,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not update status");
    }
  };

  const saveProgress = async (progressVal: number) => {
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: client.name,
          projectTitle: client.projectTitle,
          phone: client.phone,
          email: client.email || "",
          dueDate: client.dueDate,
          deploymentDate: client.deploymentDate,
          progress: progressVal,
          status: client.status,
        }),
      });

      if (!response.ok) throw new Error("Failed to update progress");

      toast.success(`Progress updated to ${progressVal}%`);
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not save progress");
      setSliderProgress(client.progress);
    }
  };

  const handleSliderValueChange = (val: number[]) => {
    const value = val[0];
    setSliderProgress(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveProgress(value);
    }, 500);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete client");

      toast.success("Client deleted");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete client");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const response = await fetch(`/api/clients/${client.id}/notes`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const resData = await response.json();
      setNotes(resData.data || []);
      setHasFetchedNotes(true);
    } catch (error) {
      console.error(error);
      toast.error("Could not load notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (notesOpen) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesOpen]);

  const handleAddNote = async (values: NoteFormValues) => {
    setSavingNote(true);
    try {
      const response = await fetch(`/api/clients/${client.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const resData = await response.json();
      const newNote = resData.data;
      setNotes((prev) => [newNote, ...prev]);
      setHasFetchedNotes(true);
      noteForm.reset();
      toast.success("Note added successfully");
      onRefresh(); // To update notes count on card
    } catch (error) {
      console.error(error);
      toast.error("Could not add note");
    } finally {
      setSavingNote(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "Not Started";
      case "in_progress": return "In Progress";
      case "ready": return "Ready/Done";
      case "delayed": return "Delayed";
      case "deployed": return "Deployed";
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "not_started": return "bg-red-50 text-red-700 border-red-200";
      case "in_progress": return "bg-primary/10 text-primary border-primary/20";
      case "ready": return "bg-green-50 text-green-700 border-green-200";
      case "delayed": return "bg-amber-50 text-amber-700 border-amber-200";
      case "deployed": return "bg-emerald-50 text-emerald-800 border-emerald-250";
      default: return "";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not Scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {isEditing ? (
          /* EDIT MODE CARD BODY */
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-3">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Client Name"
                      className="h-9 text-sm font-semibold"
                    />
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="projectTitle"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Project Name"
                      className="h-9 text-sm font-semibold"
                    />
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Phone Number"
                      className="h-9 text-sm"
                    />
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="space-y-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>Due Date</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal h-9 border-gray-200 bg-white text-xs",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={loading}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-gray-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString().split("T")[0] : "");
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  size="sm"
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3 gap-1"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  <span>Save</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    editForm.reset();
                  }}
                  disabled={loading}
                  className="border-gray-200 text-xs h-8 px-3 gap-1"
                >
                  <X className="h-3 w-3" />
                  <span>Cancel</span>
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          /* READ-ONLY VIEW CARD BODY */
          <div className="space-y-4">
            {/* Header: Name and Action Options */}
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/clients/${client.id}`}
                className="space-y-1 flex-1 block group/header cursor-pointer"
              >
                <h4 className="text-base font-bold text-gray-900 group-hover/header:text-primary group-hover/header:underline line-clamp-1">
                  {client.name}
                </h4>
                <div className="text-xs font-semibold text-primary/90 line-clamp-1" title={client.projectTitle}>
                  Project: {client.projectTitle || "General Project"}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  title="Quick Edit"
                  className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete Client"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the client and ALL their notes. This cannot be undone.
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
            </div>

            {/* Middle: Details & Dates */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
              <span>Due:</span>
              <span className="font-semibold text-gray-700">{formatDate(client.dueDate)}</span>
            </div>

            {/* Controls: Status Selection */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500">Project Status</span>
              <Select value={client.status} onValueChange={handleStatusChange}>
                <SelectTrigger className={`h-9 text-xs font-semibold border ${getStatusBadgeClass(client.status)}`}>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started" className="text-xs font-medium">Not Started</SelectItem>
                  <SelectItem value="in_progress" className="text-xs font-medium">In Progress</SelectItem>
                  <SelectItem value="ready" className="text-xs font-medium">Ready/Done</SelectItem>
                  <SelectItem value="delayed" className="text-xs font-medium">Delayed</SelectItem>
                  <SelectItem value="deployed" className="text-xs font-medium">Deployed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Controls: Slider Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Project Progress</span>
                <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.25 rounded">
                  {sliderProgress}%
                </span>
              </div>
              <Progress value={sliderProgress} className="h-1.5 w-full bg-gray-100 [&>div]:bg-primary" />
              <Slider
                min={0}
                max={100}
                step={1}
                value={[sliderProgress]}
                onValueChange={handleSliderValueChange}
                className="py-1"
              />
            </div>

            {/* Recent Notes Preview (max 2) */}
            {notes && notes.length > 0 && (
              <div className="space-y-1.5 border-t border-dashed border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <MessageSquare className="h-3 w-3 text-primary/75" />
                  <span>Recent Notes ({hasFetchedNotes ? notes.length : (client._count?.notes || 0)})</span>
                </div>
                <div className="space-y-1.5">
                  {[...notes]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 2)
                    .map((note) => (
                      <div key={note.id} className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-2 hover:bg-gray-100/50 transition-colors">
                        <p className="text-gray-700 line-clamp-2 leading-relaxed whitespace-pre-wrap font-medium">{note.content}</p>
                        <div className="text-[10px] text-gray-400 mt-1 flex justify-between items-center font-medium">
                          <span>{format(new Date(note.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Footer Buttons: Profile details link and Notes Dialog */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              {/* Profile Link */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 text-xs border-gray-200 hover:bg-primary/10 hover:text-primary h-9 font-semibold text-gray-600 gap-1"
              >
                <Link href={`/clients/${client.id}`}>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </Link>
              </Button>

              {/* Notes Dialog */}
              <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-gray-200 hover:bg-primary/10 hover:text-primary h-9 font-semibold text-gray-600 gap-1"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Notes ({hasFetchedNotes ? notes.length : (client._count?.notes || 0)})</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full sm:max-w-[500px] max-h-[85vh] flex flex-col p-6">
                  <DialogHeader className="pb-2 border-b border-gray-100">
                    <DialogTitle className="text-lg font-bold text-gray-900">
                      Notes for {client.name}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Development notes log for client {client.name}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Note Creator Form */}
                  <div className="py-4 border-b border-gray-100">
                    <Form {...noteForm}>
                      <form onSubmit={noteForm.handleSubmit(handleAddNote)} className="space-y-3">
                        <FormField
                          control={noteForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Write a development note..."
                                  disabled={savingNote}
                                  className="min-h-[80px] text-sm focus-visible:ring-primary border-gray-200"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={savingNote}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 px-4 h-9"
                          >
                            {savingNote && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Add Note</span>
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>

                  {/* Notes Feed Area */}
                  <div className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1 min-h-[200px]">
                    {loadingNotes ? (
                      Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="border border-gray-100 p-4 rounded-lg space-y-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" />
                        </div>
                      ))
                    ) : notes.length === 0 ? (
                      <p className="text-sm text-center text-gray-400 font-medium py-6">
                        No notes yet. Add your first note above.
                      </p>
                    ) : (
                      notes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onUpdate={fetchNotes}
                          onDelete={fetchNotes}
                        />
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
