# 🚀 InvMaster - Intelligent Inventory Operating System

> **Stop guessing, start tracking.** A production-ready, multi-tenant SaaS for managing inventory, orders, and suppliers with military-grade security.

![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=flat&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=flat&logo=pwa&logoColor=white)

---

## 📖 Overview

**InvMaster** is a full-featured **Inventory Management System (IMS)** engineered as a **Multi-Tenant SaaS** platform. It allows businesses ("Organizations") to sign up, manage their isolated data, and collaborate with granular role-based permissions.

Built to solve the "Spreadsheet Chaos" problem, InvMaster provides a clean, fast, and secure way to track stock movements, purchase orders, and sales in real-time.

---

## 🔥 Key Features

### 🏢 Enterprise-Grade SaaS Architecture

- **Multi-Tenancy**: Complete data isolation using PostgreSQL Row Level Security (RLS).
- **RBAC (Role-Based Access Control)**: Granular permissions (Admin, Manager, Storekeeper).
- **Team Collaboration**: Invite team members via email to join your organization.

### 📦 Smart Inventory & Operations

- **Real-Time Tracking**: "Stock In" / "Stock Out" logs with facial audit trails.
- **Multi-Warehouse**: Manage stock across multiple physical locations.
- **Mobile PWA**: Built-in support for barcode scanning using mobile cameras.
- **Bulk Operations**: CSV Import/Export for mass updates.

### 💰 Commercial & Financial modules

- **Sales & Invoices**: Generate professional invoices (PDF) and track daily sales.
- **Purchase Orders**: Full workflow (Draft -> Approve -> Receive) for supplier management.
- **Subscription Tiers**: Feature gating for Free (Starter) vs Pro plans.

### 🤖 AI & Analytics

- **Performance**: Real-time logic for Profit & Loss (P&L) and margins.
- **Charts**: Interactive visualization of stock levels and sales trends.

### ⚡ Technical Excellence

- **Super Admin Dashboard**: System-wide management and health monitoring.
- **Modern UI**: Polished Dark Mode interface using **shadcn/ui** and **Tailwind v4**.
- **Secure**: Robust authentication and database policies.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **State Management**: React Hooks & Context
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Payments**: [Cashfree](https://www.cashfree.com/)
- **Email**: [Resend](https://resend.com/)
- **PWA**: @ducanh2912/next-pwa

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (for Database & Auth)
- A Resend account (for emails)
- A Cashfree account (optional, for payments)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/Inventory-Mgm.git
   cd Inventory-Mgm
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` and populate the values:

   ```bash
   cp .env.example .env.local
   ```

   **Required Variables:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup:**

   - Go to your Supabase Project Dashboard -> SQL Editor.
   - Run the contents of `schema.sql` to initialize the database tables.
   - Run `COMPLETE_RLS_FIX.sql` to ensure Row Level Security policies are correctly applied.
   - Run other `.sql` scripts as needed for specific feature patches.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── (authenticated)/   # Protected routes (Dashboard, Inventory, Settings)
│   ├── auth/              # Auth callback handlers
│   ├── login/             # Login page
│   ├── signup/            # Registration page
│   ├── api/               # Backend API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
├── lib/                   # Utility functions & settings
└── hooks/                 # Custom React hooks
public/                    # Static assets & PWA manifest
root/
├── *.sql                  # Database migration & setup scripts
└── package.json           # Dependencies & scripts
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
