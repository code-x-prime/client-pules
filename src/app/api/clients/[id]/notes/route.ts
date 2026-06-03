import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { noteSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: clientId } = params;

  try {
    const notes = await prisma.note.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error: any) {
    console.error("GET Notes Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: clientId } = params;

  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { content } = result.data;

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const newNote = await prisma.note.create({
      data: {
        content,
        clientId,
      },
    });

    return NextResponse.json({ success: true, data: newNote }, { status: 201 });
  } catch (error: any) {
    console.error("POST Note Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create note" }, { status: 500 });
  }
}
