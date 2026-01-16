# 🚀 InvMaster: The Intelligent Inventory OS for Modern Teams

> Stop guessing, start tracking. A production-ready, multi-tenant SaaS for managing inventory, orders, and suppliers with military-grade security.

## 💡 What is InvMaster?

**InvMaster** is a full-featured Inventory Management System (IMS) built for scalability. Unlike simple "CRUD" apps, this is engineered as a **Multi-Tenant SaaS** from Day 1. It allows businesses ("Organizations") to sign up, manage their own isolated data, and collaborate with role-based permissions (Storekeeper, Manager, Admin).

I built this to solve the classic "Spreadsheet Chaos" problem—providing a clean, fast, and secure way to track stock movements and purchase orders in real-time.

## 🔥 Key Features

### 🏢 Enterprise-Grade SaaS Architecture

- **True Multi-Tenancy**: Data isolation using PostgreSQL Row Level Security (RLS). One code base, infinite organizations.
- **RBAC (Role-Based Access Control)**: Granular permissions. Storekeepers can track stock, only Admins can approve POs.
- **Team Collaboration**: Invite up to 5 team members (Pro) with specific roles.

### 📦 Smart Inventory & Operations

- **Real-Time Tracking**: "Stock In" / "Stock Out" logs with complete facial audit trails.
- **Multi-Warehouse Support**: Manage stock across multiple physical locations (e.g., Warehouse A, Store B).
- **Barcode Scanning**: Built-in PWA capabilities to scan items using mobile camera for instant stock updates.
- **Bulk Operations**: CSV Import/Export for mass inventory updates.

### 🤖 AI & Analytics (The "Brain")

- **AI Stock Predictions**: Forecasting algorithms to predict when you'll run out of stock based on sales velocity.
- **Financial Analytics**: Real-time logic for Profit & Loss (P&L), margins, and sales tracking.
- **Smart Alerts**: Automated low-stock email notifications to prevent stockouts.

### 💰 Commercial Modules

- **Sales & Invoices**: Generate professional invoices and track daily sales.
- **Purchase Orders**: Full Draft -> Approve -> Receive workflow for supplier management.
- **Subscription tiers**: Built-in support for Free (Starter) vs Pro plans with feature gating.

### ⚡ Technical Excellence

- **Super Admin Dashboard**: A "God Mode" view to manage all tenants, debugging, and system health.
- **Premium UI/UX**: Built with **shadcn/ui** and **Tailwind v4** for a sleek, dark-mode-first experience.
- **Secure by Design**: Auth & DB policies are tightly coupled via Supabase.

## 🤝 Contributing

I welcome PRs! I'm currently working on:

- [ ] Mobile PWA offline mode
- [ ] Stripe Subscription integration
- [ ] Advanced Reporting

Let me know what you think! Drop a ⭐ if you like it.

#NextJS #Supabase #SaaS #OpenSource #WebDev
