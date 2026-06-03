"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerSchema } from "@/lib/validations";
import {
  User,
  UserPlus,
  Settings as SettingsIcon,
  Loader2,
  Lock,
  Mail,
  Shield,
  Bell,
  Cpu,
} from "lucide-react";
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "register" | "system">("profile");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // System Mock States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setGlobalError(null);
    setRegisterLoading(true);

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

      toast.success("New administrator created successfully!");
      registerForm.reset();
    } catch (error: any) {
      console.error(error);
      const errMessage = error.message || "An error occurred";
      toast.error(errMessage);
      setGlobalError(errMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const currentUser = session?.user;
  const currentName = currentUser?.name || "Admin User";
  const currentEmail = currentUser?.email || "admin@clientpulse.com";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
      <Topbar title="Settings & Management" />

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-gray-200 bg-white shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex gap-4 min-w-max">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "register"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Register Administrator</span>
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "system"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <SettingsIcon className="h-4.5 w-4.5" />
            <span>System Config</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/20">
        <div className="max-w-3xl mx-auto">
          {/* PROFILE DETAILS TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm bg-white rounded-xl">
                <CardHeader className="border-b border-gray-100 p-6">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Administrator Profile</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 font-semibold mt-1">
                    Your active authorization details in ClientPulse.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Account Name
                      </span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{currentName}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{currentEmail}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        System Access Level
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-2 rounded-lg border border-primary/20 w-fit">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="uppercase">System Administrator (Root)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm bg-white rounded-xl">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Security Credentials</h4>
                    <p className="text-xs text-gray-400 font-medium">
                      Authentication passwords are encrypted using bcrypt hashing layers. Contact root support to reset keys.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* REGISTER ADMINISTRATOR TAB */}
          {activeTab === "register" && (
            <Card className="border border-gray-250 shadow-md bg-white rounded-xl">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <span>Register Administrator</span>
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold mt-1">
                  Create a new administrator account. Only accessible to authenticated admins.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {globalError && (
                      <div className="rounded-md bg-red-50 p-3 border border-red-200">
                        <p className="text-sm font-semibold text-red-800">{globalError}</p>
                      </div>
                    )}

                    {/* Name */}
                    <FormField
                      control={registerForm.control}
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
                              disabled={registerLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={registerForm.control}
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
                              disabled={registerLoading}
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
                        control={registerForm.control}
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
                                disabled={registerLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Confirm Password */}
                      <FormField
                        control={registerForm.control}
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
                                disabled={registerLoading}
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
                      disabled={registerLoading}
                      className="w-full h-10 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2"
                    >
                      {registerLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Registering Account...</span>
                        </>
                      ) : (
                        <span>Register Account</span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* SYSTEM CONFIG TAB */}
          {activeTab === "system" && (
            <Card className="border border-gray-200 shadow-sm bg-white rounded-xl">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold mt-1">
                  Adjust and tuning dashboard environment variables dynamically.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {/* Option 1: Email Alerts */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-150">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-primary" />
                        <span>Email Notifications</span>
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Send automatic daily logs summary to admin email inbox.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEmailAlerts(!emailAlerts);
                        toast.success(`Email alerts ${!emailAlerts ? "enabled" : "disabled"}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emailAlerts ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emailAlerts ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Option 2: Push Notifications */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-150">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-primary" />
                        <span>API Telemetry Logging</span>
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Log detailed developer stats into browser console metrics.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPushAlerts(!pushAlerts);
                        toast.success(`API logging telemetry ${!pushAlerts ? "enabled" : "disabled"}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        pushAlerts ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pushAlerts ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Option 3: Maintenance Mode */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-150">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>System Maintenance Mode</span>
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Restrict write database operations to root administrators only.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        toast.success(`Maintenance mode ${!maintenanceMode ? "activated" : "deactivated"}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        maintenanceMode ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          maintenanceMode ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
