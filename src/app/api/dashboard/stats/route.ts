import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Start and end of current week (Sunday to Saturday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Deploying soon (next 7 days starting from today, inclusive of today)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfSoon = new Date(startOfToday);
    endOfSoon.setDate(startOfToday.getDate() + 7);
    endOfSoon.setHours(23, 59, 59, 999);

    // 30 days ago and 60 days ago for MoM calculations
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalClients,
      dueThisWeek,
      deployingSoon,
      progressAggregate,
      recentClients,
      clientsLast30Days,
      clientsPrevious30Days,
      overdueClients,
      totalDeployed,
      completedClients
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({
        where: {
          dueDate: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      }),
      prisma.client.count({
        where: {
          deploymentDate: {
            gte: startOfToday,
            lte: endOfSoon,
          },
        },
      }),
      prisma.client.aggregate({
        _avg: {
          progress: true,
        },
      }),
      prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          _count: {
            select: { notes: true },
          },
        },
      }),
      prisma.client.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.client.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.client.count({
        where: {
          dueDate: {
            lt: startOfToday,
          },
          status: {
            notIn: ["ready", "deployed"],
          },
        },
      }),
      prisma.client.count({
        where: {
          status: "deployed",
        },
      }),
      prisma.client.count({
        where: {
          OR: [
            { progress: 100 },
            { status: { in: ["ready", "deployed"] } }
          ],
        },
      }),
    ]);

    const averageProgress = Math.round(progressAggregate._avg.progress || 0);

    // MoM growth percentage
    const clientsGrowth = clientsPrevious30Days > 0
      ? ((clientsLast30Days - clientsPrevious30Days) / clientsPrevious30Days) * 100
      : clientsLast30Days > 0 ? 100 : 0;

    return NextResponse.json({
      success: true,
      totalClients,
      dueThisWeek,
      deployingSoon,
      averageProgress,
      recentClients,
      clientsGrowth,
      clientsLast30Days,
      overdueClients,
      totalDeployed,
      completedClients
    });
  } catch (error: any) {
    console.error("GET Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
