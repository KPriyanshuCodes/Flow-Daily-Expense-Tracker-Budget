# Flow : Daily Expense Tracker & Budget

A production-quality, privacy-first mobile personal expense tracking application built with **React Native**, **Expo Router**, **TypeScript**, **SQLite** (`expo-sqlite`), and **Zustand**.

---

## 🌟 Highlights

- **100% Offline & Local**: No signups, no backend server, no cloud accounts, zero analytics or telemetry tracking.
- **Persistent SQLite Engine**: Powered by `expo-sqlite` with relational foreign keys (`PRAGMA foreign_keys = ON`), WAL mode, and indices for snappy performance.
- **Customizable Categories**: Create, rename, customize icons, and delete categories.
- **Soft-Deactivation Safety**: Protects historical records. Deactivating a category hides it from future transactions while preserving all historical expenses and monthly summaries intact.
- **Automated Monthly Tracking**:
  - Automatically isolates tracking by calendar month (e.g., `October 2026`).
  - Seamlessly starts new months at `₹0` while retaining past months permanently.
  - Interactive Month Selector to jump across historical records.
- **Live Aggregations**:
  - Total Monthly Expense
  - Category-wise Spending & Percentage Distributions
  - Highest-Spending Category
  - Daily Average Spending
  - Total Transaction Counts
- **Polished UI/UX**: Professional neutral palette (Slate, Emerald, Zinc), subtle shadows, clear typography, and responsive safe-area layouts.

---

## 📁 Architecture & File Structure

```
DailySpend/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root navigation tabs and SQLite initialization
│   ├── index.tsx                 # Dashboard & Home overview
│   ├── add-expense.tsx           # Add and Edit expense modal
│   ├── categories.tsx            # Category management screen
│   ├── summary.tsx               # Monthly analytics and breakdown
│   └── settings.tsx              # Preferences, stats & data tools
│
├── src/
│   ├── components/               # Reusable presentation components
│   │   ├── AmountInput.tsx       # Large amount input with currency symbol
│   │   ├── CategoryCard.tsx      # Category card with spending stats & actions
│   │   ├── EmptyState.tsx        # Empty state with call-to-action
│   │   ├── ExpenseCard.tsx       # Expense item card with edit/delete actions
│   │   ├── MonthSelector.tsx     # Month navigator with quick pills
│   │   └── SummaryCard.tsx       # KPI metric cards
│   │
│   ├── database/                 # SQLite persistence layer
│   │   ├── database.ts           # SQLite connection & transaction helpers
│   │   ├── migrations.ts         # Schema creation & default seed categories
│   │   ├── categoryRepository.ts # Category CRUD & stats queries
│   │   └── expenseRepository.ts  # Expense CRUD & monthly aggregations
│   │
│   ├── features/                 # Domain logic and state management
│   │   ├── categories/           # Category types, service, and Zustand store
│   │   ├── expenses/             # Expense types, service, and Zustand store
│   │   ├── monthly-summary/      # Summary aggregation service and types
│   │   └── settings/             # Settings store (currency, demo data seeding)
│   │
│   ├── constants/                # Colors, spacing, icons, and defaults
│   │   ├── colors.ts             # Neutral theme palette
│   │   ├── defaults.ts           # Default categories & icon list
│   │   └── spacing.ts            # Margins, radiuses, shadows
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── calculations.ts       # Breakdown and average formulas
│   │   ├── currency.ts           # Currency formatters & amount parsers
│   │   └── date.ts               # Date manipulations & formatting
│   │
│   └── types/                    # Domain models and DTO interfaces
│
├── scripts/                      # Automated test scripts
│   ├── verify-logic.ts           # Business rules and math tests
│   └── verify-database.ts        # SQLite constraint and multi-month tests
│
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go on iOS or Android (optional, for physical device preview)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```


### 3. Run Automated Tests
Execute the comprehensive test suite verifying calculation logic, date utilities, SQLite schema constraints, foreign key restrictions, and soft-deactivation:
```bash
npm test
```

### 4. Type Check
Verify strict TypeScript compliance:
```bash
npx tsc --noEmit
```

---

## 🛠 Features in Detail

### 1. Dashboard
- **Total Spent Banner**: Real-time month spending.
- **Top Metrics**: Transaction counts and highest-spending category badge.
- **Prominent Add Button**: Obvious and accessible primary action.
- **Category-wise Spending**: Breakdown of each category's total and percentage.
- **Recent Expenses**: Latest transactions with tap-to-edit and delete options.

### 2. Add / Edit Expense
- Large amount input with currency prefix and numeric pad.
- Visual category chips.
- Date selector (Today, Yesterday, or custom date `YYYY-MM-DD`).
- Optional note input.
- Strong input validation preventing non-positive amounts or missing categories.

### 3. Category Management
- Create custom categories with custom icons from 20+ curated options.
- Rename existing categories.
- Delete unused categories.
- Deactivate categories that already contain recorded expenses to safeguard financial records.
- Restore deactivated categories at any time.
- Assign categories to expenses for better financial organization and tracking.
- View the total expenses recorded under each category.
- Prevent duplicate category names to maintain consistency.

### 4. Monthly Summary & History
- Navigate past months with month selector.
- Visual spending distribution progress bars.
- Highest category share and daily average calculation.
- Chronological list of all expenses in the selected month.

### 5. Settings & Data Tools
- View local SQLite storage health and transaction counts.
- **Seed Demo Expenses**: One-tap populate sample data matching the prompt's `₹2,090` example (`Food ₹850`, `Gas ₹500`, `Milk ₹420`, `Eggs ₹320`) and previous-month entries for instant testing.
