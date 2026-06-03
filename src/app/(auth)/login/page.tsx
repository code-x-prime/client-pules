"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Rocket, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginSchema } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setGlobalError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email.toLowerCase(),
        password: values.password,
      });

      if (result?.error) {
        toast.error("Failed to sign in. Please check your credentials.");
        setGlobalError(result.error);
      } else {
        toast.success("Signed in successfully!");
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative premium radial glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-500 text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
            <Rocket className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white font-heading">
            ClientPulse
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            Sign in to access your client logs & milestones
          </p>
        </div>

        <Card className="border border-white/10 shadow-2xl p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl text-white">
          <CardHeader className="space-y-1 p-0 pb-6">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </CardTitle>
            <p className="text-xs text-gray-400">Enter your admin credentials below</p>
          </CardHeader>
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {globalError && (
                  <div className="rounded-xl bg-red-500/10 p-3.5 border border-red-500/20">
                    <p className="text-xs font-semibold text-red-400">{globalError}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-gray-300">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@clientpulse.com"
                          type="email"
                          className="h-11 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus-visible:ring-primary focus-visible:border-primary/50 text-sm rounded-xl transition-all"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          className="h-11 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus-visible:ring-primary focus-visible:border-primary/50 text-sm rounded-xl transition-all"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-primary/20 active:translate-y-px transition-all duration-155"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          ClientPulse Inc. &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}
