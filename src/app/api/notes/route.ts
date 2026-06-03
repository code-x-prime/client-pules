import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Fetch notes related to clients created by the admin or general notes
    const notes = await prisma.note.findMany({
      where: search
        ? {
            OR: [
              { content: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { client: { projectTitle: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
      include: {
        client: {
          select: {
            id: true,
            name: true,
            projectTitle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error: any) {
    console.error("GET All Notes Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
