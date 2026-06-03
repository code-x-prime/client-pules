import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  projectTitle: z.string().min(2, "Project title must be at least 2 characters").default("General Project"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  dueDate: z.string().optional().nullable().or(z.date()),
  deploymentDate: z.string().optional().nullable().or(z.date()),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(["not_started", "in_progress", "ready", "delayed", "deployed"]).default("not_started"),
});

export const noteSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty"),
});
