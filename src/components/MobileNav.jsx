import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PieChart, History, Edit3 } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Add', path: '/add-expense', icon: PlusCircle },
    { label: 'Breakdown', path: '/breakdown', icon: PieChart },
    { label: 'History', path: '/history', icon: History },
    { label: 'Income', path: '/edit-income', icon: Edit3 },
  ];

  return (
    <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-dark border-t border-slate-800 shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 transition-colors min-w-0 ${
                isActive ? 'text-brand-accent font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 xs:w-5 xs:h-5 shrink-0 ${isActive ? 'text-brand-accent' : 'text-slate-400'}`} />
              <span className="text-[10px] xs:text-[11px] font-medium truncate w-full text-center leading-tight tracking-tighter sm:tracking-normal px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
