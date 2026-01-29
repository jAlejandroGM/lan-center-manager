# LAN Center Manager

**LAN Center Manager** is a specialized Financial & Administrative Platform designed for LAN Centers (Cyber Cafes). Unlike traditional "Cyber Control" software that manages PC time, this system focuses exclusively on **Revenue Operations (RevOps)**: daily cash flow, expense tracking, shift management, and customer debt lifecycles.

Built on a **Serverless Architecture** using React 19 and Supabase, it enforces strict financial integrity through a "Business Date" vs. "System Date" logic, ensuring that reports remain accurate regardless of when data is entered.

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live-success?style=flat-square)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

## Key Features

### 🛡️ Financial Integrity & Timezone Logic

- **Strict Timezone Handling:** The system enforces `America/Lima` (UTC-5) across all transactions using a centralized `dateUtils` core, preventing reporting errors caused by server/client time differences.
- **Business vs. System Time:**
  - **Business Date (`date`):** Used for financial reports. Allows retroactive entry of data for correct accounting periods.
  - **Audit Timestamp (`created_at`):** Immutable system timestamp for security and auditing.
- **Future-Proof Validation:** Logic prevents recording payments or debts in future dates relative to the system time.

### 💰 Debt Lifecycle Management

- **State Machine:** Tracks debts through `PENDING` -> `PAID` or `CANCELLED` states.
- **Payment Attribution:** Supports partial or full payments via multiple methods (CASH, YAPE), correctly attributing the income to the specific "Business Day" cash flow, not just the timestamp of the click.
- **Audit Trails:** Every action (creation, payment, cancellation) logs the user ID responsible for the change.

### 🔐 Security & Access Control

- **Soft-Auth RBAC:** PIN-based authentication system optimized for high-turnover staff environments.
  - **ADMIN:** Full access to Daily Logs, Expenses, and Debt annulment.
  - **WORKER:** Restricted access focused on Debt collection and viewing.
  - **VIEWER:** Read-only access to Dashboards and History.
- **Backend Security:** Data integrity is secured via Supabase **Row Level Security (RLS)** policies.

## Tech Stack

- **Frontend Core:** React 19, Vite 7.
- **Styling:** Tailwind CSS v4 (Zero-runtime), Lucide React (Iconography).
- **Backend (BaaS):** Supabase (PostgreSQL DB, Auth, Edge Network).
- **State Management:** React Context API (`AuthContext`, `ToastContext`).
- **Utilities:** `date-fns` for temporal logic, `Intl.DateTimeFormat` for localization.

## Project Structure

The codebase follows a modular feature-based architecture:

```bash
src/
├── components/
│   ├── daily/       # Forms for Daily Logs & Expenses (Business Logic)
│   ├── debts/       # Debt List, Forms & Payment Modals
│   ├── layout/      # App Shell, Sidebar & Protected Routes
│   └── ui/          # Atomic components (Toasts, Modals, Selectors)
├── constants/       # Enums for Roles, Payment Methods, & Categories
├── context/         # Global State (Authentication & Notifications)
├── hooks/           # Custom Hooks
│   ├── useAuth.js   # Session management
│   ├── useFetch.js  # Data fetching with caching & stale-while-revalidate
│   └── useToast.js  # Feedback system
├── pages/           # Route Views
│   ├── DailyEntry   # Admin-only daily closing interface
│   ├── Dashboard    # Financial analytics & KPIs
│   ├── Debts        # Operational debt management
│   ├── History      # Monthly/Daily breakdown
│   └── Login        # PIN Entry
├── services/        # Supabase Data Access Layer (DAL)
│   ├── debtService.js
│   ├── expenseService.js
│   └── logService.js
└── utils/
    ├── calculations.js # Financial aggregation logic
    └── dateUtils.js    # Centralized Timezone/Date logic (Critical)
```

## License

This project is proprietary software. Unauthorized copying, modification, distribution, or use is strictly prohibited.

## Author

Developed with ☕ by **Alejandro Guzmán** [@alguzdev](https://alguzdev.vercel.app/)
