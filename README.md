# Commodity Management System

A production-ready Commodity Management System built with Next.js, Supabase, and Tailwind CSS.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `schema.sql` (located in the root of this project) and paste it into the SQL Editor.
4. Run the SQL script to create the tables and policies.

### 2. Environment Variables

1. Copy `.env.example` to `.env.local` (create the file if it doesn't exist).
   ```bash
   cp .env.example .env.local
   ```
2. Get your Supabase URL and Anon Key from **Project Settings > API**.
3. Update `.env.local` with your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Authentication**: Email/Password login via Supabase Auth.
- **Dashboard**: Overview of inventory and stock movements.
- **Inventory**: Manage items, view stock levels.
- **Stock Movements**: Track IN/OUT movements (Coming soon).
- **Suppliers**: Manage suppliers (Coming soon).
- **Purchase Orders**: Create and manage POs (Coming soon).
- **Reports**: View reports (Coming soon).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
