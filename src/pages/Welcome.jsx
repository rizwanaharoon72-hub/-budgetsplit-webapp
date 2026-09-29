import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Wallet, ShieldCheck, PieChart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';

export function Welcome({ isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col justify-between max-w-full overflow-x-hidden">
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 font-bold text-lg sm:text-xl tracking-tight text-white shrink-0">
          <div className="p-1.5 sm:p-2 bg-brand-accent rounded-xl shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span>Budget<span className="text-brand-accent">Split</span></span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white px-2.5 sm:px-3">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" className="px-2.5 sm:px-3">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 text-center py-10 sm:py-20 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] sm:text-xs font-medium text-teal-400 mb-6 max-w-full">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">The Smart 50/30/20 Budgeting Rule</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-tight">
          Master Your Money with <span className="text-brand-accent">BudgetSplit</span>
        </h1>

        <p className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-8 sm:mb-10 leading-relaxed">
          Take full control of your income. Automatically allocate your budget into Needs (50%), Wants (30%), and Savings (20%) in PKR.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={ArrowRight} fullWidth>
              Start Free Budgeting
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="border-slate-700 text-slate-200 hover:bg-slate-800" fullWidth>
              Sign In to Account
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 text-left w-full">
          <div className="bg-slate-800/60 border border-slate-700/60 p-5 sm:p-6 rounded-2xl">
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl w-fit mb-4">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-semibold text-white text-base sm:text-lg mb-2">50% Needs</h3>
            <p className="text-xs sm:text-sm text-slate-400">Housing, utilities, groceries, and essential living expenses automatically prioritized.</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-5 sm:p-6 rounded-2xl">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-4">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">30% Wants</h3>
            <p className="text-xs sm:text-sm text-slate-400">Entertainment, dining out, and personal hobbies kept strictly within limits.</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-5 sm:p-6 rounded-2xl">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">20% Savings</h3>
            <p className="text-xs sm:text-sm text-slate-400">Emergency fund and future investments calculated automatically from income.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        BudgetSplit MVP — Personal Budgeting Application (PKR)
      </footer>
    </div>
  );
}
