import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { noteSchema } from "@/lib/validations";

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
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { content } = result.data;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error: any) {
    console.error("PUT Note Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update note" }, { status: 500 });
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
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Note Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete note" }, { status: 500 });
  }
}
