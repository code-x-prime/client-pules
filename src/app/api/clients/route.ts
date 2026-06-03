import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("order") || searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const allowedSortFields = ["name", "dueDate", "deploymentDate", "progress", "createdAt"];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
        include: {
          notes: {
            orderBy: { createdAt: "desc" },
            take: 2,
          },
          _count: {
            select: { notes: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      clients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET Clients Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

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
    const adminId = (session.user as { id: string }).id;

    const newClient = await prisma.client.create({
      data: {
        name,
        projectTitle,
        phone,
        email: email || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        deploymentDate: deploymentDate ? new Date(deploymentDate) : null,
        progress,
        status,
        createdBy: adminId,
      },
    });

    return NextResponse.json({ success: true, data: newClient }, { status: 201 });
  } catch (error: any) {
    console.error("POST Client Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create client" }, { status: 500 });
  }
}
