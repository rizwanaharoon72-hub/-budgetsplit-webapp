import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { formatPKR } from '../utils/budgetCalculator';
import { PieChart, ShieldCheck, HeartHandshake, PiggyBank } from 'lucide-react';

export function BudgetCard({ category, title, description, limit, spent, statusObj }) {
  const remaining = limit - spent;
  const isOver = remaining < 0;

  const categoryIcons = {
    needs: ShieldCheck,
    wants: HeartHandshake,
    savings: PiggyBank,
  };

  const Icon = categoryIcons[category] || PieChart;

  return (
    <Card className="hover:border-slate-300 transition-all">
      <div className="flex flex-col gap-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-100 text-brand-accent shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 capitalize text-sm sm:text-base">{title || category}</h3>
              {description && <p className="text-xs text-brand-muted">{description}</p>}
            </div>
          </div>
          <Badge status={statusObj} spent={spent} limit={limit} />
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 py-2 border-y border-slate-100">
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-brand-muted block">Spent</span>
            <span className="text-base sm:text-lg font-bold text-slate-900 truncate block">{formatPKR(spent)}</span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-brand-muted block">Budget Limit</span>
            <span className="text-base sm:text-lg font-bold text-slate-700 truncate block">{formatPKR(limit)}</span>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar spent={spent} limit={limit} statusObj={statusObj} />

        {/* Remaining Footnote */}
        <div className="flex justify-between items-center text-xs pt-1">
          <span className="text-brand-muted">Remaining Balance:</span>
          <span className={`font-bold ${isOver ? 'text-brand-danger' : 'text-slate-800'}`}>
            {isOver ? `Over by ${formatPKR(Math.abs(remaining))}` : formatPKR(remaining)}
          </span>
        </div>
      </div>
    </Card>
  );
}
