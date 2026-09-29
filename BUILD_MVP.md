# BUILD_MVP.md — BudgetSplit MVP Frontend Build Specification

> This is a **BUILD specification**, not a PRD. It exists to let an AI coding tool (e.g. Google Antigravity) build the BudgetSplit MVP frontend without needing to ask clarifying questions. It does not introduce new features, does not change the 50/30/20 concept, and does not integrate Supabase or Firebase at this stage.

---

## 1. Project Overview

**Product Name:** BudgetSplit

BudgetSplit is a simple personal budgeting web application that helps users manage their monthly income using the **50/30/20 budgeting rule** (Needs 50% / Wants 30% / Savings 20%). A user enters their monthly income, receives an automatic budget allocation, records expenses against categories, and sees real-time status of how their spending compares to their limits.

This build stage produces a **fully functional frontend MVP**, built and validated against a prior Problem Statement, Product Idea, PRD, MVP Plan, and UI/UX Design System. Backend integration (Supabase) is intentionally deferred to the next stage.

**Currency:** PKR

---

## 2. Assignment Objective

Build the first working version of BudgetSplit as a **frontend-only, functional MVP** — not a set of static mockups. The build must demonstrate:

- Working navigation across all screens
- Responsive layouts (desktop, tablet, mobile — min width 375px)
- Functional UI components with real interactions
- Working forms with validation
- Loading, error, empty, and success states
- Clean, scalable project structure
- Reusable components
- Local/mock data and localStorage in place of a real backend, structured so Supabase can be added later with minimal rework

---

## 3. MVP Scope

**In scope for this build:**
- Full frontend UI for the entire core budgeting loop
- Mock/local authentication (no real backend)
- Local state + localStorage for income, expenses, and monthly history
- Real-time 50/30/20 calculation logic
- Full CRUD on expenses (create, read, delete — no edit)
- Category breakdown with charts (Recharts)
- Monthly history using mock data
- Editable income with recalculation

**Out of scope for this build (explicitly deferred):**
- Supabase Auth / Database / Row Level Security
- Firebase (must never be used)
- Any real persistence beyond the browser (localStorage only)
- Any feature not in the approved MVP Plan

---

## 4. MVP Features

| Feature | Behavior in this build |
|---|---|
| Authentication (mock) | Signup and login using local/mock logic, not a real backend |
| Onboarding | Collect name and monthly income, validate, calculate 50/30/20 |
| Automatic 50/30/20 Budget | Reusable calculation logic derived from income, not hardcoded |
| Dashboard | Income, limits, spending, progress, status, alerts, recent expenses |
| Add Expense | Title, amount, category (Need/Want/Saving), validation, feedback |
| Delete Expense | Remove an expense and recalculate all dependent values |
| Category Breakdown | Spending by category with chart + numeric breakdown |
| Smart Alerts / Status | On Track / Near Limit / Over Budget, shown with icon + color + text |
| Monthly History | Mock/local previous-month data display |
| Edit Income | Update income, recalculate limits, update all dependent UI |
| Validation | All forms validate required fields and numeric input |
| Responsive UI | Mobile-first, scales to tablet and desktop, no horizontal overflow |

---

## 5. Features Not Included

Do **not** build any of the following at this stage:

- Real authentication or backend integration (Supabase comes later)
- Firebase in any form
- Payment systems or billing
- Investment tracking
- Bank account integrations
- AI-generated financial advice
- Admin panels
- Multi-currency support (PKR only)
- Editing an existing expense (delete + re-add is sufficient for MVP)
- Advanced analytics/reporting beyond dashboard + category breakdown + history
- Decorative animations that do not support usability

---

## 6. Complete Screen List

1. Welcome / Landing
2. Login
3. Signup
4. Onboarding
5. Dashboard
6. Add Expense
7. Category Breakdown
8. Monthly History
9. Edit Income

---

## 7. Navigation Flow

```
Welcome / Landing
   ├── Login ──────────────┐
   └── Signup ─────────────┼──> Onboarding ──> Dashboard
                            │                       │
                            └───────────────────────┘
Dashboard
   ├── Add Expense ──> (back to) Dashboard
   ├── Category Breakdown ──> (back to) Dashboard
   ├── Monthly History ──> (back to) Dashboard
   └── Edit Income ──> (back to) Dashboard
```

Rules:
- Unauthenticated users cannot access Dashboard, Add Expense, Category Breakdown, Monthly History, or Edit Income (mock route guarding using local auth state).
- A logged-in user with no onboarding data completed is redirected to Onboarding before Dashboard.
- A persistent nav (desktop: sidebar or top navbar; mobile: bottom nav or hamburger menu) links Dashboard, Add Expense, Category Breakdown, Monthly History, and a logout action, visible only when authenticated.

---

## 8. User Flow

**New user:**
Landing → Signup → Onboarding (name + income) → 50/30/20 calculated → Dashboard → Add Expense → Dashboard updates → Category Breakdown → Monthly History.

**Returning user:**
Landing → Login → Dashboard → review budget → Add/Delete expenses → Category Breakdown / Alerts → Monthly History.

**Income update:**
Dashboard → Edit Income → enter new value → validate → recalculate 50/30/20 → Dashboard updates.

---

## 9. Functional Requirements

### Auth (mock)
- Signup form: name, email, password (+ confirm password) with validation.
- Login form: email, password with validation.
- On submit: show a brief loading state (simulate ~600–1000ms delay), then either:
  - Success → store mock session (e.g., `localStorage` flag/object) → route to Onboarding (if first-time) or Dashboard.
  - Error → show inline error (e.g., "invalid credentials" for login, "email already in use" for signup — simulated).
- No real password hashing or network calls; this is a frontend-only simulation.

### Onboarding
- Fields: name, monthly income.
- Validate: name required (non-empty), income required, numeric, greater than 0.
- On submit: calculate 50/30/20 limits, persist name + income to localStorage, route to Dashboard.

### Dashboard
- Display: current monthly income, Needs/Wants/Savings limits, amount spent per category, total spent, remaining amount, progress bars per category, overall + per-category status badges, alerts, recent expenses (last 3–5), current month/year, Add Expense CTA.
- Empty state: if no expenses exist yet, show an EmptyState component prompting the user to add their first expense.

### Add Expense
- Fields: title/description, amount, category (Need / Want / Saving).
- Validate: title required, amount required/numeric/greater than 0, category required.
- On submit: simulate brief loading, then success feedback (toast/inline message), append expense to localStorage, return to Dashboard with updated totals.
- Simulate an occasional/failable operation only if useful for demonstrating an error state (optional; not required for core flow).

### Delete Expense
- Delete action available on each expense item (Dashboard recent list and/or a dedicated expense list).
- Confirm before deleting (simple confirm modal).
- On delete: remove from localStorage, recalculate and update all dependent values immediately.

### Category Breakdown
- Show Needs, Wants, Savings each with: amount spent, budget limit, percentage used, remaining amount, status.
- Include a chart (Recharts — bar or pie/donut) summarizing category spending.
- Empty state: if a category has no expenses, show 0 spent / full remaining, not an error.

### Monthly History
- List of previous months (mock data) with income, total spent, and status summary per month.
- Empty state: if no history exists (e.g., first month), show an EmptyState explaining history will appear after a full month of activity.

### Edit Income
- Show current income, input for new income, validation (numeric, greater than 0).
- On submit: recalculate 50/30/20 limits, update localStorage, show success feedback, reflect changes immediately on Dashboard.

---

## 10. Budget Calculation Logic

Implement as a **pure, reusable function** (e.g. `src/utils/budgetCalculator.js`), not hardcoded per-screen values.

```
function calculateBudget(monthlyIncome) {
  return {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
  };
}
```

Example: Income = 100,000 PKR → Needs = 50,000 / Wants = 30,000 / Savings = 20,000.

This function must be called anywhere budget limits are needed (Onboarding, Dashboard, Edit Income, Category Breakdown) rather than duplicating the math.

---

## 11. Expense Logic

Expense data model (frontend, localStorage-backed):

```
{
  id: string,           // generated (e.g. crypto.randomUUID() or uuid lib)
  title: string,
  amount: number,
  category: "need" | "want" | "saving",
  date: string,          // ISO date
  month: string,         // e.g. "2026-09" for grouping
  createdAt: string
}
```

Rules:
- Adding an expense appends to the current month's expense list.
- Deleting an expense removes it and triggers recalculation of: total spent, spent-per-category, remaining amounts, statuses, and chart data.
- All amounts are treated as PKR, no decimals required beyond standard currency formatting.
- Expense category maps 1:1 to a budget bucket (Need → Needs limit, Want → Wants limit, Saving → Savings limit).

---

## 12. Status/Alert Logic

Define a single reusable status function (e.g. `src/utils/getBudgetStatus.js`) used everywhere a status is shown:

```
function getStatus(spent, limit) {
  const percent = limit > 0 ? (spent / limit) * 100 : 0;
  if (percent >= 100) return "OVER_BUDGET";
  if (percent >= 80) return "NEAR_LIMIT";
  return "ON_TRACK";
}
```

Status → visual mapping (never color alone — always pair with icon + text label):

| Status | Color | Label | Icon suggestion |
|---|---|---|---|
| ON_TRACK | Success `#16A34A` | "On Track" | check circle |
| NEAR_LIMIT | Warning `#F59E0B` | "Near Limit" | alert triangle |
| OVER_BUDGET | Danger `#DC2626` | "Over Budget" | alert octagon |

Apply this consistently on: Dashboard summary, per-category progress bars, Category Breakdown, and any alert banners.

---

## 13. Loading / Error / Empty / Success States

**Loading:**
- Login/Signup submission (button spinner + disabled state)
- Add Expense submission (button spinner + disabled state)
- Any simulated async action (brief artificial delay, e.g. `setTimeout`)

**Error:**
- Invalid form input (inline field-level messages: required, invalid format)
- Invalid income (non-numeric, zero, negative)
- Invalid expense amount (non-numeric, zero, negative)
- Simulated failed operation, where used (generic inline/toast error with retry option)

**Empty:**
- No expenses yet (Dashboard, Category Breakdown context)
- No monthly history yet
- A category with zero expenses (show 0/limit, not broken UI)

**Success:**
- Expense added (toast or inline confirmation)
- Income updated (toast or inline confirmation)
- Signup/Login completed (redirect functions as the confirmation; optional brief toast)

Each of these must use the shared `LoadingState`, `ErrorState`, `EmptyState`, and `Alert`/toast components — not one-off inline implementations per screen.

---

## 14. UI/UX Design Rules

Follow the approved BudgetSplit Design System exactly. Do not redesign.

**Design direction:** Clean, modern, minimal, professional, finance-focused, trustworthy, beginner-friendly.

**Color palette:**

| Role | Hex |
|---|---|
| Primary / Dark | `#0F172A` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Primary Accent | `#0F766E` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |
| Secondary Text | `#64748B` |
| Border | `#CBD5E1` |

**Typography:** Inter (or comparable clean sans-serif). Bold, prominent numeric treatment for income/budget figures. Short labels and helper text — avoid long paragraphs.

**Spacing:** 8px system — 8 / 16 / 24 / 32 / 40 / 48px.

**Component rules:**
- Rounded cards, subtle borders/shadows, consistent radius across the app.
- Solid primary buttons for main actions; outline/neutral for secondary; danger styling for destructive actions.
- Clear form labels above inputs, visible focus states, validation messages below fields.
- Status communicated via color + icon + text, never color alone.
- No new colors introduced per-screen without semantic purpose.
- No decorative animation that hurts usability; keep transitions minimal and purposeful.

---

## 15. Responsive Requirements

| Breakpoint | Rules |
|---|---|
| Desktop | Multi-column dashboard, persistent nav (sidebar or top bar), charts/cards side by side, generous spacing |
| Tablet | Cards wrap to fewer columns, nav remains accessible, charts resize without overflow |
| Mobile (min 375px) | Single-column layout, full-width primary buttons, stacked cards, compact nav (bottom nav or hamburger), touch-friendly tap targets (min ~44px) |

Global rule: **no horizontal overflow at any breakpoint.**

---

## 16. Component Requirements

Build these as reusable components (do not duplicate markup across pages):

- `Button` (primary, secondary/outline, danger variants; loading state)
- `Input` (label, error message, helper text)
- `Select` (for expense category)
- `Card`
- `Navbar` / `Sidebar` (desktop) and `MobileNav` (mobile)
- `ProgressBar` (with status color)
- `BudgetCard` (income/limit display)
- `ExpenseItem` (with delete action)
- `Alert` (success/warning/danger/info)
- `Badge` (On Track / Near Limit / Over Budget)
- `Modal` (used for delete confirmation)
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ChartCard` (wraps Recharts chart with title/legend)

---

## 17. Project/File Structure

```
src/
├── components/
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Card.jsx
│   ├── Navbar.jsx
│   ├── MobileNav.jsx
│   ├── ProgressBar.jsx
│   ├── BudgetCard.jsx
│   ├── ExpenseItem.jsx
│   ├── Alert.jsx
│   ├── Badge.jsx
│   ├── Modal.jsx
│   ├── EmptyState.jsx
│   ├── LoadingState.jsx
│   ├── ErrorState.jsx
│   └── ChartCard.jsx
├── pages/
│   ├── Welcome.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Onboarding.jsx
│   ├── Dashboard.jsx
│   ├── AddExpense.jsx
│   ├── CategoryBreakdown.jsx
│   ├── MonthlyHistory.jsx
│   └── EditIncome.jsx
├── layouts/
│   └── AppLayout.jsx        // authenticated shell with nav
├── hooks/
│   ├── useAuth.js           // mock auth state
│   ├── useBudget.js         // income + calculated limits
│   └── useExpenses.js       // expense CRUD against localStorage
├── utils/
│   ├── budgetCalculator.js
│   ├── getBudgetStatus.js
│   └── storage.js           // localStorage read/write helpers
├── data/
│   └── mockHistory.js       // mock monthly history data
├── types/
│   └── index.js (or .d.ts if TS is used)  // shared shape definitions/JSDoc
├── assets/
└── App.jsx
```

Do not create files beyond what this structure implies.

---

## 18. Local/Mock Data Strategy

- **Auth:** mock session stored in `localStorage` (e.g. `budgetsplit_session`), containing `{ name, email, isAuthenticated }`. No real credential checking beyond simple non-empty/format validation.
- **User profile:** `{ name, monthlyIncome }` stored in `localStorage` (e.g. `budgetsplit_profile`).
- **Expenses:** array of expense objects (see Section 11) stored in `localStorage` (e.g. `budgetsplit_expenses`), grouped/filterable by `month`.
- **Monthly history:** static mock array in `src/data/mockHistory.js` for prior months; current month is derived live from actual localStorage expense data.
- All reads/writes to localStorage go through a single `storage.js` utility (get/set/remove helpers), never accessed ad hoc from components.
- Data shapes are designed to map directly onto the future Supabase tables (`profiles`, `expenses`) described in the MVP Plan, so migration later only requires swapping the storage layer, not the data model.

---

## 19. Future Supabase Integration Notes

This build must make the next stage (Supabase integration) straightforward:

- Keep all data access behind hooks (`useAuth`, `useBudget`, `useExpenses`) rather than calling `localStorage` directly from components — these hooks are the seam where Supabase calls will later replace localStorage calls.
- Keep the `expenses` object shape aligned with the planned Supabase `expenses` table (`id`, `user_id`, `amount`, `category`, `note`, `expense_date`/`month`, timestamps).
- Keep the profile object shape aligned with the planned `profiles`/`users` table (`id`, `name`, `email`, `current_monthly_income`, timestamps).
- Do not hardcode assumptions that only work with localStorage (e.g., synchronous reads) — treat hook functions as if they could become async, even though they aren't yet.
- Do not integrate Supabase or its client libraries in this stage.

---

## 20. Development Rules

1. Do not add features outside the MVP scope.
2. Do not integrate Supabase yet.
3. Do not use Firebase.
4. Do not create admin panels.
5. Do not add payment systems.
6. Do not add investment tracking.
7. Do not add bank integrations.
8. Do not add AI financial advice.
9. Do not add animations that hurt usability.
10. Do not deviate from the approved UI/UX design direction.
11. Keep the interface professional and realistic.
12. All interactions must actually function — no static/fake buttons.
13. Keep business logic (calculations, status) separate from UI components.
14. Design data structures for straightforward future Supabase integration.
15. Keep scope appropriate for a university assignment — do not over-engineer.

---

## 21. Acceptance Criteria

- [ ] All 9 screens exist and are reachable via working navigation.
- [ ] Signup and Login work end-to-end with mock auth, including loading and error states.
- [ ] Onboarding correctly validates and calculates 50/30/20 from entered income.
- [ ] Dashboard accurately reflects income, limits, spending, remaining amounts, statuses, and alerts.
- [ ] Adding an expense updates the Dashboard, Category Breakdown, and totals immediately.
- [ ] Deleting an expense updates all dependent values immediately, with confirmation.
- [ ] Category Breakdown shows correct spent/limit/percentage/remaining/status per category, with a working chart.
- [ ] Monthly History displays mock previous-month data plus the live current month.
- [ ] Edit Income recalculates and propagates new limits across the app.
- [ ] Loading, error, empty, and success states are implemented for every listed scenario in Section 13.
- [ ] Status logic (On Track / Near Limit / Over Budget) is consistent across Dashboard, progress bars, alerts, and Category Breakdown, and never relies on color alone.
- [ ] Layout is fully responsive with no horizontal overflow at 375px, tablet, and desktop widths.
- [ ] All listed reusable components exist and are actually reused (not duplicated per page).
- [ ] Project structure matches Section 17.
- [ ] No Supabase or Firebase dependencies are present in this build.

---

## 22. Definition of Done

The MVP build is considered done when:

- Every acceptance criterion in Section 21 is met.
- The app runs locally via Vite (`npm run dev`) without console errors.
- The app builds for production (`npm run build`) without errors.
- The full core loop (Signup/Login → Onboarding → Dashboard → Add Expense → Category Breakdown → Monthly History → Edit Income) can be demonstrated in a single walkthrough using only local/mock data.
- Refreshing the browser preserves user data (auth session, profile, expenses) via localStorage.
- The UI visually matches the approved design system (colors, spacing, typography, components) without introducing a new visual direction.

---

## 23. Suggested Development Order

1. **Project setup** — Vite + React + Tailwind CSS, base folder structure, design tokens (colors, spacing, font) configured in Tailwind.
2. **Core utilities** — `budgetCalculator.js`, `getBudgetStatus.js`, `storage.js`.
3. **Base components** — `Button`, `Input`, `Select`, `Card`, `Badge`, `Alert`, `LoadingState`, `ErrorState`, `EmptyState`, `Modal`.
4. **Mock auth** — `useAuth` hook, Welcome, Login, Signup pages with validation and loading/error states.
5. **Onboarding** — form, validation, budget calculation, persist profile.
6. **App shell** — `AppLayout` with `Navbar`/`Sidebar` and `MobileNav`, route guarding for authenticated pages.
7. **Dashboard** — `useBudget` + `useExpenses` hooks, `BudgetCard`, `ProgressBar`, recent expenses list, alerts, empty state.
8. **Add Expense** — form, validation, loading/success feedback, integration with `useExpenses`.
9. **Delete Expense** — confirmation modal, recalculation on delete.
10. **Category Breakdown** — `ChartCard` with Recharts, per-category stats, empty states.
11. **Monthly History** — mock data file, history list UI, empty state for no history.
12. **Edit Income** — form, validation, recalculation, propagate updates.
13. **Responsive pass** — verify all screens at 375px, tablet, and desktop widths; fix overflow issues.
14. **Final QA pass** — walk through every item in Section 21 (Acceptance Criteria) and Section 22 (Definition of Done).
