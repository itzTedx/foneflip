# 📊 Foneflip Admin Portal - Reports Page

The Reports Page of the **Foneflip Admin Portal** offers powerful analytics and insights to track marketplace performance, vendor activity, product performance, and transaction flow in real time.

## 🚀 Features

### 🔎 Sales Overview
- Total sales, order volume, average order value
- Sales trends over time (daily, weekly, monthly)
- Top-selling products and categories

### 🏪 Vendor Performance
- List of vendors with revenue, orders, ratings, and payout status
- Individual vendor detail reports
- Return and dispute stats per vendor

### 📦 Product Reports
- Detailed product sales and inventory performance
- Units sold, current stock, return rate
- Filterable by category, vendor, status

### 💰 Transactions & Payouts
- Track all vendor payouts, platform commissions, and refunds
- Sort by date, status, or transaction type
- Export to CSV/PDF

### 📈 Visual Analytics
- Interactive line, bar, and pie charts for trends and summaries
- Filters by date, vendor, category, and order status

## 🛠️ Tech Stack

- **Next.js 15 App Router**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Drizzle ORM** with PostgreSQL
- **BullMQ** + **Redis** for heavy data processing
- **Recharts / Chart.js / Victory** for data visualizations

### Access Reports Page
Visit: [/reports](http://localhost:3000/reports)

## 📤 Export & Automation
- Export any report to CSV or PDF

- Scheduled reports (coming soon) can be auto-emailed monthly to admins

## 🔐 Access Control
- Only authenticated admins can view full reports

- Vendor-specific views planned for future vendor dashboard integration

---

## 🛠️ Developer To-Do – Foneflip Admin Reports Page

This document outlines the development tasks and checklist for building and maintaining the **Reports Page** in the Foneflip Admin Portal.

---

### 🔧 Core Reports Implementation

- [ ] Create API routes to aggregate:
  - [ ] Total sales, order count, average order value
  - [ ] Vendor-level revenue, product count, order stats
  - [ ] Product-level sales, stock, return stats
  - [ ] All transactions (sales, payouts, refunds)

---

### 📊 Charts & Visualizations

- [ ] Implement sales trend line chart (daily, monthly)
- [ ] Add bar chart for top-selling products
- [ ] Pie chart for category-wise sales distribution
- [ ] Donut chart for order statuses

---

### 🧩 Filters & Controls

- [ ] Date range picker (Today, Last 7 Days, Custom)
- [ ] Vendor and category dropdown filters
- [ ] Search and sort functionality in all tables

---

### 📦 Product & Vendor Tables

- [ ] Paginated and filterable product sales table
- [ ] Vendor performance table with expandable rows for details
- [ ] Return rate and dispute metrics column

---

### 💰 Transaction Management

- [ ] Build transaction history table (linked to payouts/refunds)
- [ ] Add filters for transaction type, status, vendor

---

### 📤 Export & Automation

- [ ] CSV export for each report section
- [ ] PDF export for entire dashboard snapshot
- [ ] Scheduled report generation via BullMQ (coming soon)

---

### 🔐 Access & Permissions

- [ ] Restrict report routes to admin roles
- [ ] Add auth check middleware for `/admin/reports`

---

### 🧪 Testing

- [ ] Unit tests for report aggregators (sales, payouts, returns)
- [ ] Integration tests for `/api/admin/reports/*` endpoints
- [ ] Frontend UI tests (e.g. Playwright or Cypress)

---

### ✨ Future Improvements

- [ ] Vendor self-report view (limited metrics)
- [ ] Custom report builder interface (select fields/date ranges)
- [ ] Real-time report updates with Socket.IO or SWR polling

---

_Last updated: August 1, 2025_
