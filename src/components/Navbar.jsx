import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PieChart, History, Edit3, LogOut, Wallet } from 'lucide-react';
import { Button } from './Button';

export function Navbar({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Add Expense', path: '/add-expense', icon: PlusCircle },
    { label: 'Breakdown', path: '/breakdown', icon: PieChart },
    { label: 'History', path: '/history', icon: History },
    { label: 'Edit Income', path: '/edit-income', icon: Edit3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-brand-dark text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight text-white hover:opacity-90 shrink-0">
            <div className="p-1.5 bg-brand-accent rounded-lg shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span>Budget<span className="text-brand-accent">Split</span></span>
            <span className="hidden min-[400px]:inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">50/30/20</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-accent' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <span className="hidden sm:inline-block text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 truncate max-w-[150px]">
                {user.name || user.email}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={onLogout}
              icon={LogOut}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 sm:px-3"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
