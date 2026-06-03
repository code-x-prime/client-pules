# ClientPulse — Professional Client Management Dashboard

ClientPulse is a professional client management dashboard built using Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui components, Prisma ORM, and NextAuth.js.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js (Credentials provider)
- **Validation**: Zod

## Features
- **Dashboard**: High-level key performance metrics (Total Clients, Due This Week, Deploying Soon, Avg. Progress) and recent client logs.
- **Client Directory**: Paginated directory (30 records/page) with full-text search, status filter, sorting options, client creation dialog, and deletion alerts.
- **Client Profile**: Deep-dive profile view featuring:
  - Phone and Email contact cards.
  - Interactive Project Progress slider.
  - Dropdown to modify status.
  - Project Log Notes (reverse chronological feed) supporting inline creation, updates, and deletes with toast alerts.
- **Admin Registration**: Protected route accessible only to authenticated admins to add new administrators.

---

## Setup & Installation

### 1. Prerequisites
Ensure you have Node.js (version 18 or above) and a PostgreSQL database instance running.

### 2. Clone the Repository & Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```
Ensure you provide:
- `DATABASE_URL`: A valid PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A secure random secret key (e.g., generated with `openssl rand -base64 32`).
- `NEXTAUTH_URL`: The URL of your local environment (typically `http://localhost:3000`).

### 4. Database Setup & Seeding
Deploy database migrations to create the tables, then seed the initial admin credentials:
```bash
npx prisma migrate dev
npx prisma db seed
```

This will automatically seed the initial admin account:
- **Email**: `admin@clientpulse.com`
- **Password**: `Admin@123`

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Log in with the seeded credentials to access the client management panel.
