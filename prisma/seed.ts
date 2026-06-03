import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@clientpulse.com";
  
  // Find or create admin
  let admin = await prisma.user.findUnique({
    where: { email },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    admin = await prisma.user.create({
      data: {
        email,
        name: "Admin User",
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Seeded admin user:", admin.email);
  } else {
    console.log("Admin user already exists.");
  }

  // Check if we already have clients seeded
  const clientCount = await prisma.client.count();
  if (clientCount > 0) {
    console.log("Clients already seeded. Skipping sample client generation.");
    return;
  }

  // Create 5 sample clients with varied statuses, dates, and progress values
  const sampleClients = [
    {
      name: "Alpha Systems",
      phone: "+1 (555) 019-2834",
      email: "contact@alphasystems.com",
      status: "in_progress",
      progress: 45,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now (Due this week!)
      deploymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
      notes: {
        create: [
          { content: "Project kickoff completed successfully. Scope defined." },
          { content: "Completed wireframes review. Client approved interface layouts." },
          { content: "Frontend repository initialized and styling system configured." },
        ],
      },
    },
    {
      name: "Beta Logistics",
      phone: "+1 (555) 024-5867",
      email: "info@betalogistics.org",
      status: "ready",
      progress: 100,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      deploymentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (Deploying soon!)
      createdBy: admin.id,
      notes: {
        create: [
          { content: "Database design finalized and migration executed." },
          { content: "Testing phase completed. All unit tests passing." },
        ],
      },
    },
    {
      name: "Gamma Tech Group",
      phone: "+1 (555) 038-9121",
      email: "hello@gammatech.io",
      status: "delayed",
      progress: 60,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now (Due this week!)
      deploymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
      notes: {
        create: [
          { content: "Sprint 1 review completed. Slight delay on API integration." },
          { content: "Third-party gateway credentials delayed by the client." },
          { content: "Development paused pending client assets deliverable." },
          { content: "Escalated assets request to project sponsor." },
        ],
      },
    },
    {
      name: "Delta Retail Solutions",
      phone: "+1 (555) 041-3948",
      email: "support@deltaretail.com",
      status: "deployed",
      progress: 100,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deploymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
      notes: {
        create: [
          { content: "Production server configured and certificates installed." },
          { content: "Domain mapping completed. Live deployment successful." },
          { content: "Handoff documentation delivered to the client support team." },
        ],
      },
    },
    {
      name: "Epsilon Media",
      phone: "+1 (555) 056-4739",
      email: "billing@epsilonmedia.com",
      status: "not_started",
      progress: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deploymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
      notes: {
        create: [
          { content: "Contract signed by both parties." },
          { content: "Kickoff meeting scheduled for next Monday at 10 AM." },
        ],
      },
    },
  ];

  for (const clientData of sampleClients) {
    const client = await prisma.client.create({
      data: clientData,
    });
    console.log(`Seeded client: ${client.name} with notes`);
  }

  console.log("Seeded successfully");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
