"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { clientSchema } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface QuickAddClientCardProps {
  onSuccess: () => void;
}

type ClientFormValues = z.input<typeof clientSchema>;

export function QuickAddClientCard({ onSuccess }: QuickAddClientCardProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as unknown as Resolver<ClientFormValues>,
    defaultValues: {
      name: "",
      projectTitle: "",
      phone: "",
      email: "",
      dueDate: "",
      deploymentDate: "",
      progress: 0,
      status: "not_started",
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate || null,
          deploymentDate: values.deploymentDate || null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create client");
      }

      toast.success("Client added successfully");
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Could not add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-dashed border-primary/30 shadow-sm rounded-xl overflow-hidden bg-primary/5 hover:border-primary/50 transition-colors duration-200">
      <CardHeader className="p-5 pb-3 border-b border-dashed border-primary/10">
        <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
          <Plus className="h-4.5 w-4.5" />
          <span>Quick Add Client</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-600">Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="e.g. John Doe"
                      className="h-9 text-sm bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Project Title Input */}
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-600">Project / Contract Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="e.g. Website Redesign"
                      className="h-9 text-sm bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Phone Input */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-600">Phone *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="e.g. +123456789"
                      className="h-9 text-sm bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Due Date Picker */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="space-y-1 flex flex-col">
                  <FormLabel className="text-xs font-semibold text-gray-600 mb-1">Due Date</FormLabel>
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
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Status Selector */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-600">Initial Status</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_started" className="text-xs font-medium">Not Started</SelectItem>
                      <SelectItem value="in_progress" className="text-xs font-medium">In Progress</SelectItem>
                      <SelectItem value="ready" className="text-xs font-medium">Ready/Done</SelectItem>
                      <SelectItem value="delayed" className="text-xs font-medium">Delayed</SelectItem>
                      <SelectItem value="deployed" className="text-xs font-medium">Deployed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 mt-4 gap-1.5 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>Add Client</span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
