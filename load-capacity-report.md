# Inventory Management System: Load Capacity & Performance Analysis

## 1. Executive Summary

Based on the code analysis of `Inventory-Mgm`, particularly `src/app/actions/items.ts` and the architecture (Next.js App Router + Supabase), here is the high-level capacity estimate:

| Tier                         | Concurrent Users (Est.) | Daily Active Users (Est.) | Bottleneck                              |
| :--------------------------- | :---------------------- | :------------------------ | :-------------------------------------- |
| **Free (Vercel + Supabase)** | 10 - 20                 | 500 - 1,000               | Database Connections & Function Timeout |
| **Pro (Vercel + Supabase)**  | 100 - 500+              | 10,000+                   | Database CPU & Complex Queries          |

> **Verdict**: The current architecture is well-suited for a SaaS product but `items.ts` has specific inefficiencies (N+1 queries) that will hit Free tier limits quickly if multiple users upload items simultaneously.

---

## 2. Code-Level Bottleneck Analysis

I analyzed `src/app/actions/items.ts` and found a critical "Latency Chain" in the `createItem` function.

### The "Latency Chain" (createItem)

Every time a user creates an item, the server performs these **sequential** database round-trips:

1.  **Auth Check**: `supabase.auth.getUser()` (1 request)
2.  **Profile & Plan Fetch**: `supabase.from('profiles')...` (1 request)
3.  **Count Check**: `supabase.from('items').select(count)...` (1 request - _Heavy on large tables_)
4.  **Insert Item**: `supabase.from('items').insert(...)` (1 request)
    - _Trigger Overhead_: If you have DB triggers, they add implicit load here.
5.  **Location Fetch**: `getWarehouseCookie()` -> `supabase.from('locations')...` (1 request)
6.  **Stock Insert**: `supabase.from('item_stock').insert(...)` (1 request)
7.  **Movement Log**: `supabase.from('stock_movements').insert(...)` (1 request)
8.  **Audit Log**: `logAction(...)` (1 request)

**Total**: ~8 DB Requests per Item Created.
**Impact**: If DB latency is 50ms, one item create takes **400ms+** of pure network time, excluding processing.
**Risk**: On Vercel Free tier, Serverless Functions time out after **10 seconds**. A bulk import of just 20-30 items (if done sequentially) could time out.

---

## 3. Platform Limits Analysis

### A. Database (Supabase)

| Feature           | Free Tier Limit        | Paid (Pro) Tier          | Impact on You                                                                                                                                                                                                   |
| :---------------- | :--------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database Size** | 500 MB                 | 8 GB+                    | You store images or large text? 500MB fills up fast with `stock_movements` logs.                                                                                                                                |
| **Connections**   | 60 direct / 300 pooled | 90 direct / 1,500 pooled | **CRITICAL**. Next.js Server Actions open new connections frequently. You MUST use the connection pooler (Tranascation mode) in production or you will see "Too many clients" errors with >20 concurrent users. |
| **Egress**        | 2 GB / month           | 50 GB / month            | High if you have many image downloads or large reports.                                                                                                                                                         |

### B. Hosting (Vercel)

| Feature                | Hobby (Free)            | Pro ($20/mo)         | Impact on You                                                                         |
| :--------------------- | :---------------------- | :------------------- | :------------------------------------------------------------------------------------ |
| **Function Duration**  | 10 Seconds (Hard limit) | 60 Seconds (Default) | **CRITICAL**. Creating items/bulk upload must allow for >10s execution.               |
| **Bandwidth**          | 100 GB                  | 1 TB                 | Likely sufficient for now.                                                            |
| **Image Optimization** | 1,000 Source Images     | 5,000                | If you display many product images on the landing page/dashboard, this gets eaten up. |

---

## 4. Recommendations for Scale

### 1. Optimize `createItem` (Database)

Combine queries using a Postgres Database Function (RPC) or `Promise.all`.

- **Current**: Fetch Profile -> Wait -> Fetch Count -> Wait -> Insert.
- **Optimized**: `Promise.all([getUser, getProfile])`.
- **Best**: Create a PL/pgSQL function `create_full_item(...)` that does permission checks and inserts inside the database. This reduces 8 round-trips to **1**.

### 2. Connection Pooling

Ensure your `DATABASE_URL` in `.env` uses the **Supabase Transaction Pooler** (port 6543 usually), not the direct connection (port 5432). This is mandatory for Next.js Serverless environments.

### 3. Bulk Import Strategy

Your `bulkCreateItems` loop is efficiently batched (`.insert(cleanItems)`), which is **GOOD**.
However, the subsequent `movements` insert:

```typescript
// Good: Bulk insert
await supabase.from("stock_movements").insert(movements);
```

This is also good.
**Warning**: If `items` array is >1000, split it into chunks of 100 to avoid request size limits or timeouts.

## 5. Load Testing Strategy

Use the provided script `scripts/load-test.js` to simulate traffic.

**What to Monitor:**

1.  **Supabase Dashboard**: Look at "CPU %" and "Active Connections". If Connections hit 60 (Free), your app fails.
2.  **Vercel Dashboard**: Look at "Function Execution Time". If it nears 1000ms avg, users will feel lag.

### Recommended Test

Start with **5 Virtual Users** running for **30 seconds**.
`node scripts/load-test.js` (After configuration)

DO NOT run >50 concurrent users against Free Tier deployments; you might get IP banned or rate-limited immediately.
