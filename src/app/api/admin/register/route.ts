import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // Check authorization - only existing admins can register new users
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = result.data;
    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email address already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: "admin", // All new registrants from here are admins as per rules
      },
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }, { status: 201 });
  } catch (error) {
    console.error("POST Admin Register Error:", error);
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
  }
}
