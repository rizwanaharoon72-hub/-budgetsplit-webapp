import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useBudget } from './hooks/useBudget';
import { useExpenses } from './hooks/useExpenses';
import { AppLayout } from './layouts/AppLayout';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { AddExpense } from './pages/AddExpense';
import { CategoryBreakdown } from './pages/CategoryBreakdown';
import { MonthlyHistory } from './pages/MonthlyHistory';
import { EditIncome } from './pages/EditIncome';
import { LoadingState } from './components/LoadingState';

export default function App() {
  const auth = useAuth();
  const budget = useBudget(auth.user?.id);
  const expenses = useExpenses(budget.limits, auth.user?.id);

  // Show full-screen splash while restoring session or loading profile
  if (auth.loading || (auth.isAuthenticated && budget.loading && !budget.profile)) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <LoadingState message="Loading BudgetSplit…" />
      </div>
    );
  }

  // Build a UI-friendly user object for Navbar / AppLayout from the Supabase user
  const uiUser = auth.user
    ? {
        id: auth.user.id,
        email: auth.user.email,
        name: budget.profile?.name || auth.user.user_metadata?.name || auth.user.email?.split('@')[0] || 'User',
        isAuthenticated: true,
      }
    : null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ──────────────────────────────────────────── */}
        <Route path="/" element={<Welcome isAuthenticated={auth.isAuthenticated} />} />

        <Route
          path="/login"
          element={
            auth.isAuthenticated ? (
              <Navigate to={budget.hasIncomeConfigured ? '/dashboard' : '/onboarding'} replace />
            ) : (
              <Login
                onLogin={auth.login}
                onGoogleLogin={auth.loginWithGoogle}
                hasIncomeConfigured={budget.hasIncomeConfigured}
              />
            )
          }
        />

        <Route
          path="/signup"
          element={
            auth.isAuthenticated ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Signup
                onSignup={auth.signup}
                onGoogleLogin={auth.loginWithGoogle}
              />
            )
          }
        />

        {/* ── Authenticated Routes (AppLayout handles guard + nav) ───── */}
        <Route
          element={
            <AppLayout
              user={uiUser}
              onLogout={auth.logout}
              hasIncomeConfigured={budget.hasIncomeConfigured}
            />
          }
        >
          <Route
            path="/onboarding"
            element={
              <Onboarding
                user={uiUser}
                onComplete={async (data) => {
                  await budget.setProfile(data);
                }}
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <Dashboard
                profile={budget.profile}
                limits={budget.limits}
                expensesHook={expenses}
              />
            }
          />

          <Route
            path="/add-expense"
            element={<AddExpense expensesHook={expenses} />}
          />

          <Route
            path="/breakdown"
            element={
              <CategoryBreakdown limits={budget.limits} expensesHook={expenses} />
            }
          />

          <Route
            path="/history"
            element={
              <MonthlyHistory profile={budget.profile} expensesHook={expenses} />
            }
          />

          <Route
            path="/edit-income"
            element={
              <EditIncome
                profile={budget.profile}
                onUpdateIncome={async (income) => {
                  await budget.updateIncome(income);
                }}
              />
            }
          />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
