"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  Plus,
  Rocket,
  Loader2,
  FileText,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { noteSchema } from "@/lib/validations";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { NoteCard } from "@/components/note-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

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
  notes: Note[];
}

type NoteFormValues = z.infer<typeof noteSchema>;

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [savingNote, setSavingNote] = useState(false);

  // Separate local slider state for instant drag UI response
  const [sliderProgress, setSliderProgress] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
    },
  });

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Client not found");
          router.push("/clients");
          return;
        }
        throw new Error("Failed to load client details");
      }
      const resData = await response.json();
      const clientObj = resData.data;
      setClient(clientObj);
      setSliderProgress(clientObj.progress);
      setNotes(clientObj.notes || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load client details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Saves generic fields (e.g. status)
  const saveClientField = async (updatedFields: Partial<Client>) => {
    if (!client) return;

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
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
          status: client.status,
          ...updatedFields,
        }),
      });

      if (!response.ok) throw new Error("Failed to update client details");
      
      const resData = await response.json();
      const updatedClientObj = resData.data;
      setClient(updatedClientObj);
      if (updatedFields.status !== undefined) {
        toast.success(`Status updated to ${getStatusLabel(updatedClientObj.status)}`);
      } else {
        toast.success("Client updated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not save changes");
    }
  };

  // Dedicated progress saver with toast notification
  const saveProgress = async (progressVal: number) => {
    if (!client) return;
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
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
      
      const resData = await response.json();
      const updatedClientObj = resData.data;
      setClient(updatedClientObj);
      toast.success(`Progress updated to ${progressVal}%`);
    } catch (error) {
      console.error(error);
      toast.error("Could not save progress change");
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

  const handleStatusChange = (value: string) => {
    if (client && value !== client.status) {
      saveClientField({ status: value as Client["status"] });
    }
  };

  const handleAddNoteSubmit = async (values: NoteFormValues) => {
    setSavingNote(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const resData = await response.json();
      const newNote = resData.data;
      setNotes((prev) => [newNote, ...prev]);
      form.reset();
      toast.success("Note added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Could not save note");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_started":
        return <Badge className="bg-red-50 text-red-700 border border-red-200 rounded-full font-semibold px-3.5 py-1">Not Started</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold px-3.5 py-1">In Progress</Badge>;
      case "ready":
        return <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full font-semibold px-3.5 py-1">Ready/Done</Badge>;
      case "delayed":
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold px-3.5 py-1">Delayed</Badge>;
      case "deployed":
        return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-full font-semibold px-3.5 py-1">Deployed</Badge>;
      default:
        return <Badge className="rounded-full px-3.5 py-1">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not Scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Topbar title="Client Details" />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 md:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        </main>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header Navigation */}
      <Topbar
        title="Client Profile"
        actions={
          <Button
            variant="outline"
            asChild
            className="border-gray-255 hover:bg-gray-50 text-gray-700 font-semibold"
          >
            <Link href="/clients" className="flex items-center gap-1">
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Clients</span>
            </Link>
          </Button>
        }
      />

      {/* Main Details Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
        {/* Large Header Banner Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {client.name}
              </h2>
              <span className="text-sm font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                Project: {client.projectTitle || "General Project"}
              </span>
              {getStatusBadge(client.status)}
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Registered on {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Progress Circular/Bar Visual */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-150 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div className="space-y-1 md:text-right">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Completion Rate
              </span>
              <span className="text-2xl font-black text-primary block">
                {client.progress}%
              </span>
            </div>
            <div className="w-[120px]">
              <Progress value={client.progress} className="h-3 w-full bg-gray-100 [&>div]:bg-primary" />
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <Card className="border border-gray-200 shadow-sm lg:col-span-2 bg-white">
            <CardHeader className="border-b border-gray-100 p-6">
              <CardTitle className="text-base font-bold text-gray-900">
                Contact & Scheduling Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider">
                      Phone Number
                    </span>
                    <span className="text-sm font-bold text-gray-900">{client.phone}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider">
                      Email Address
                    </span>
                    <span className="text-sm font-bold text-gray-900 truncate block max-w-[200px]">
                      {client.email || "No Email Provided"}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider">
                      Contract Due Date
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatDate(client.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Deployment Date */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-green-50 text-green-600 shrink-0">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider">
                      Deployment Target
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatDate(client.deploymentDate)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Management Panel */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100 p-6">
              <CardTitle className="text-base font-bold text-gray-900">
                Quick Project Tuning
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Status Update */}
              <div className="space-y-2">
                <Label htmlFor="status-select" className="text-sm font-bold text-gray-700">
                  Update Milestone Status
                </Label>
                <Select
                  value={client.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status-select" className="h-10">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="ready">Ready/Done</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                  <Label htmlFor="progress-slider">Completion Progress</Label>
                  <span className="text-primary font-extrabold">{sliderProgress}%</span>
                </div>
                <div className="flex items-center gap-4 py-2">
                  <Slider
                    id="progress-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[sliderProgress]}
                    onValueChange={handleSliderValueChange}
                    className="py-2 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] font-semibold text-gray-400">
                  * Drag slider to instantly save progress (debounced by 500ms).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Feed Container */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span>Project Log Notes ({notes.length})</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Inline Note Form */}
            <Card className="border border-gray-200 shadow-sm bg-white lg:col-span-1">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="text-base font-bold text-gray-900">
                  Log New Update Note
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddNoteSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Write your note here... Updates, project logs, meeting items."
                              className="min-h-[120px] border-gray-200 focus-visible:ring-primary leading-relaxed text-sm"
                              disabled={savingNote}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={savingNote}
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2"
                    >
                      {savingNote ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Logging...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4.5 w-4.5" />
                          <span>Add Note</span>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Chronological Notes List */}
            <div className="lg:col-span-2 space-y-4">
              {notes.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500 font-medium shadow-sm">
                  No notes yet. Add your first note above.
                </div>
              ) : (
                notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onUpdate={fetchClientData}
                    onDelete={fetchClientData}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
