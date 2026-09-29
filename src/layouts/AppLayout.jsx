import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileNav } from '../components/MobileNav';

export function AppLayout({ user, onLogout, hasIncomeConfigured }) {
  const location = useLocation();

  // Guard: not authenticated → login
  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Guard: authenticated but onboarding incomplete (income not set) → force onboarding
  if (!hasIncomeConfigured && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-dark pb-20 md:pb-8">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
