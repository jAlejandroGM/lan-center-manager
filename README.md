# LAN Center Manager (SaaS Multi-Tenant)

![Status](https://img.shields.io/badge/Status-MVP-blue) ![License](https://img.shields.io/badge/License-Private-red) ![Version](https://img.shields.io/badge/Version-1.0.0-green)

## 🇬🇧 English

### Project Summary

**LAN Center Manager** is a specialized SaaS (Software as a Service) application designed to manage the daily finances and operations of LAN Centers (Cyber Cafes). Built with a **Serverless Architecture** using React and Supabase, it focuses on financial integrity, debt tracking, and role-based access control.

Currently in its **MVP (Minimum Viable Product)** stage, the system features a robust "Soft Auth" mechanism for quick role switching (Admin/Worker/Viewer) and a strict Timezone-aware logic (UTC-5 Lima/Peru) to prevent financial discrepancies in daily logs.

### Key Features

- **Financial Management:**
  - **Daily Logs:** Track cash, digital payments (Yape), and night shift income with strict date validation.
  - **Expense Tracking:** Categorized expense logging with real-time timestamping.
  - **Debt System:** Complete lifecycle management (Create -> Pending -> Paid/Cancelled) with "Time Travel" capabilities for retroactive payments.
- **Architecture & Security:**
  - **Serverless Backend:** Powered by Supabase (PostgreSQL) for real-time data and scalability.
  - **Role-Based Access (RBAC):** PIN-based authentication system separating Admin, Worker, and Viewer privileges.
  - **Timezone Integrity:** Centralized date logic enforcing `America/Lima` (UTC-5) standards across all transactions.
- **UX/UI:**
  - **Modern Interface:** Built with React 19 and Tailwind CSS v4.
  - **Responsive Design:** Optimized for desktop monitors used by cashiers.

### Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Lucide React.
- **Backend (BaaS):** Supabase (PostgreSQL, RLS Policies).
- **Utilities:** date-fns (Timezone handling), React Router DOM.

---

## 🇪🇸 Español

### Resumen del Proyecto

**LAN Center Manager** es una aplicación SaaS (Software as a Service) especializada diseñada para gestionar las finanzas y operaciones diarias de LAN Centers (Cabinas de Internet). Construida con una **Arquitectura Serverless** utilizando React y Supabase, se enfoca en la integridad financiera, el seguimiento de deudas y el control de acceso basado en roles.

Actualmente en su etapa **MVP (Producto Mínimo Viable)**, el sistema cuenta con un mecanismo robusto de "Soft Auth" para el cambio rápido de roles (Admin/Trabajador/Visualizador) y una lógica estricta de Zona Horaria (UTC-5 Lima/Perú) para prevenir discrepancias financieras en los registros diarios.

### Características Principales

- **Gestión Financiera:**
  - **Registros Diarios:** Seguimiento de efectivo, pagos digitales (Yape) e ingresos del turno noche con validación estricta de fechas.
  - **Control de Gastos:** Registro de gastos categorizados con sellado de tiempo en tiempo real.
  - **Sistema de Deudas:** Gestión completa del ciclo de vida (Crear -> Pendiente -> Pagado/Anulado) con capacidades de "Time Travel" para pagos retroactivos.
- **Arquitectura y Seguridad:**
  - **Backend Serverless:** Impulsado por Supabase (PostgreSQL) para datos en tiempo real y escalabilidad.
  - **Control de Acceso (RBAC):** Sistema de autenticación basado en PIN que separa privilegios de Admin, Trabajador y Visualizador.
  - **Integridad de Zona Horaria:** Lógica de fechas centralizada que impone los estándares de `America/Lima` (UTC-5) en todas las transacciones.
- **UX/UI:**
  - **Interfaz Moderna:** Construida con React 19 y Tailwind CSS v4.
  - **Diseño Responsivo:** Optimizado para monitores de escritorio utilizados por cajeros.

### Stack Tecnológico

- **Frontend:** React 19, Vite, Tailwind CSS 4, Lucide React.
- **Backend (BaaS):** Supabase (PostgreSQL, Políticas RLS).
- **Utilidades:** date-fns (Manejo de zonas horarias), React Router DOM.

---

## Project Structure / Estructura del Proyecto

```bash
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
│   ├── daily/       # Daily log & expense forms
│   ├── debts/       # Debt management components
│   ├── layout/      # Main layout & protected routes
│   └── ui/          # Generic UI elements (Modals, Toasts)
├── constants/       # Global constants (Roles, Categories)
├── context/         # React Context (Auth, Toast)
├── hooks/           # Custom Hooks (useAuth, useFetch, useDebounce)
├── pages/           # Main Application Views
│   ├── DailyEntry   # Daily financial input
│   ├── Dashboard    # Analytics overview
│   ├── Debts        # Debt management system
│   ├── History      # Historical records
│   └── Login        # PIN-based authentication
├── services/        # Supabase API integration layers
└── utils/           # Core logic (dateUtils.js for UTC-5 handling)
```

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
