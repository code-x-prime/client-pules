"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerSchema } from "@/lib/validations";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setGlobalError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create administrator");
      }

      toast.success("New admin created successfully!");
      form.reset();
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errMessage = error.message || "An error occurred";
      toast.error(errMessage);
      setGlobalError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gray-50">
      {/* Sidebar Layout */}
      <Sidebar className="hidden md:flex shrink-0 h-full" />

      {/* Main Panel */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-white overflow-hidden">
        <Topbar title="Settings & Management" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 flex justify-center items-start pt-8 md:pt-12">
          <div className="w-full max-w-xl">
            <Card className="border border-gray-250 shadow-md bg-white">
              <CardHeader className="border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Register Administrator
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-gray-400 mt-1">
                      Create a new administrator account. Only accessible to authenticated admins.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {globalError && (
                      <div className="rounded-md bg-red-50 p-3 border border-red-200">
                        <p className="text-sm font-semibold text-red-800">{globalError}</p>
                      </div>
                    )}

                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jane Doe"
                              className="h-10 border-gray-200"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jane@clientpulse.com"
                              className="h-10 border-gray-200"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Password */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Password (min 8 chars)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-10 border-gray-200"
                                disabled={loading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Confirm Password */}
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-10 border-gray-200"
                                disabled={loading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        "Register Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
