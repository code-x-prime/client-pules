import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    console.error("GET Client By ID Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch client" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { name, projectTitle, phone, email, dueDate, deploymentDate, progress, status } = result.data;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        projectTitle,
        phone,
        email: email || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        deploymentDate: deploymentDate ? new Date(deploymentDate) : null,
        progress,
        status,
      },
    });

    return NextResponse.json({ success: true, data: updatedClient });
  } catch (error: any) {
    console.error("PUT Client Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Client Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete client" }, { status: 500 });
  }
}
