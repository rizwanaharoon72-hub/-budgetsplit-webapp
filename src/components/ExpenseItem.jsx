import React from 'react';
import { Trash2, Pencil, ShieldCheck, HeartHandshake, PiggyBank, Calendar } from 'lucide-react';
import { formatPKR } from '../utils/budgetCalculator';

export function ExpenseItem({ expense, onDelete, onEdit }) {
  const categoryConfig = {
    need: {
      label: 'Need (50%)',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldCheck,
    },
    want: {
      label: 'Want (30%)',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: HeartHandshake,
    },
    saving: {
      label: 'Saving (20%)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: PiggyBank,
    },
  };

  const config = categoryConfig[expense.category] || categoryConfig.need;
  const CategoryIcon = config.icon;
  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-brand-border hover:border-slate-300 transition-all shadow-sm gap-2 sm:gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
          <CategoryIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900 truncate text-xs sm:text-base leading-snug">
            {expense.title}
          </h4>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
            <span
              className={`inline-flex items-center text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded border ${config.badgeClass}`}
            >
              {config.label}
            </span>
            <span className="text-[11px] sm:text-xs text-brand-muted flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <span className="font-bold text-slate-900 text-xs sm:text-base whitespace-nowrap">
          {formatPKR(expense.amount)}
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(expense)}
            title="Edit expense"
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-brand-accent hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(expense)}
            title="Delete expense"
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-brand-danger hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
