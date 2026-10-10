import React, { useMemo, useState } from 'react';
import { History, Calendar, FileDown, FileText } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { Button } from '../components/Button';
import { formatPKR } from '../utils/budgetCalculator';
import { getBudgetStatus } from '../utils/getBudgetStatus';
import { generatePDFReport, exportCSVReport } from '../utils/reportGenerator';

export function MonthlyHistory({ profile, limits, expensesHook }) {
  const { expenses, loading, error, refreshExpenses } = expensesHook;
  const [exportingPDF, setExportingPDF] = useState(null);
  const [exportingCSV, setExportingCSV] = useState(null);

  const monthlyIncome = Number(profile?.current_monthly_income || profile?.monthlyIncome) || 0;

  // Group ALL expenses (not just current month) by YYYY-MM
  const groupedHistory = useMemo(() => {
    const byMonth = {};

    expenses.forEach((exp) => {
      const month = exp.month || (exp.date ? exp.date.slice(0, 7) : null);
      if (!month) return;

      if (!byMonth[month]) {
        byMonth[month] = {
          isoMonth: month,
          month: new Date(month + '-01').toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }),
          income: monthlyIncome,
          needsSpent: 0,
          wantsSpent: 0,
          savingsSpent: 0,
          totalSpent: 0,
          expenseList: [],
        };
      }

      const amt = Number(exp.amount) || 0;
      byMonth[month].totalSpent += amt;
      byMonth[month].expenseList.push(exp);
      if (exp.category === 'need') byMonth[month].needsSpent += amt;
      else if (exp.category === 'want') byMonth[month].wantsSpent += amt;
      else if (exp.category === 'saving') byMonth[month].savingsSpent += amt;
    });

    // Sort newest first
    return Object.values(byMonth).sort((a, b) => b.isoMonth.localeCompare(a.isoMonth));
  }, [expenses, monthlyIncome]);

  const currentIsoMonth = new Date().toISOString().slice(0, 7);

  const handleExportPDF = async (item) => {
    try {
      setExportingPDF(item.isoMonth);
      const totals = {
        needsSpent: item.needsSpent,
        wantsSpent: item.wantsSpent,
        savingsSpent: item.savingsSpent,
        totalSpent: item.totalSpent,
      };
      await generatePDFReport({
        profile,
        month: item.isoMonth,
        expenses: item.expenseList,
        totals,
        limits: limits || {},
      });
    } catch (err) {
      console.error('[MonthlyHistory] PDF export error:', err);
    } finally {
      setExportingPDF(null);
    }
  };

  const handleExportCSV = (item) => {
    try {
      setExportingCSV(item.isoMonth);
      const totals = {
        needsSpent: item.needsSpent,
        wantsSpent: item.wantsSpent,
        savingsSpent: item.savingsSpent,
        totalSpent: item.totalSpent,
        needsLimit: limits?.needs || 0,
        wantsLimit: limits?.wants || 0,
        savingsLimit: limits?.savings || 0,
      };
      exportCSVReport({
        month: item.isoMonth,
        expenses: item.expenseList,
        profile,
        totals,
      });
    } catch (err) {
      console.error('[MonthlyHistory] CSV export error:', err);
    } finally {
      setExportingCSV(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading monthly history…" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load history"
        message={error}
        onRetry={refreshExpenses}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Monthly History</h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Review your previous monthly budgeting performance. Export any month as PDF or CSV.
        </p>
      </div>

      {groupedHistory.length === 0 ? (
        <EmptyState
          title="No monthly history yet"
          description="Your budget history will accumulate automatically as you add expenses month after month."
          icon={History}
        />
      ) : (
        <div className="space-y-4">
          {groupedHistory.map((item) => {
            const statusObj = getBudgetStatus(item.totalSpent, item.income);
            const remaining = item.income - item.totalSpent;
            const savingsRate = item.income > 0
              ? ((item.savingsSpent / item.income) * 100).toFixed(1)
              : '0.0';
            const isCurrent = item.isoMonth === currentIsoMonth;
            const isExportingThisPDF = exportingPDF === item.isoMonth;
            const isExportingThisCSV = exportingCSV === item.isoMonth;

            return (
              <Card
                key={item.isoMonth}
                className={isCurrent ? 'border-brand-accent shadow-md bg-gradient-to-r from-teal-50/30 to-white' : ''}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Month name + status */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Calendar className={`w-4 h-4 ${isCurrent ? 'text-brand-accent' : 'text-slate-400'} shrink-0`} />
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">{item.month}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-accent text-white uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge status={statusObj} spent={item.totalSpent} limit={item.income} />
                      <span className="text-xs text-brand-muted">
                        Saved:{' '}
                        <strong className="text-slate-800">{savingsRate}%</strong> of income
                      </span>
                    </div>
                  </div>

                  {/* Numeric breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-brand-muted block text-[11px] sm:text-xs">Income</span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">{formatPKR(item.income)}</span>
                    </div>
                    <div>
                      <span className="text-brand-muted block text-[11px] sm:text-xs">Total Spent</span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">{formatPKR(item.totalSpent)}</span>
                    </div>
                    <div>
                      <span className="text-brand-muted block text-[11px] sm:text-xs">Needs Spent</span>
                      <span className="font-semibold text-slate-700 text-xs sm:text-sm truncate block">{formatPKR(item.needsSpent)}</span>
                    </div>
                    <div>
                      <span className="text-brand-muted block text-[11px] sm:text-xs">Remaining</span>
                      <span className={`font-bold text-xs sm:text-sm truncate block ${remaining < 0 ? 'text-brand-danger' : 'text-slate-900'}`}>
                        {formatPKR(remaining)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                  <span className="text-xs text-brand-muted font-medium mr-1">Export {item.month}:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={FileText}
                    isLoading={isExportingThisPDF}
                    disabled={isExportingThisPDF || isExportingThisCSV}
                    onClick={() => handleExportPDF(item)}
                    className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs py-1.5"
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={FileDown}
                    isLoading={isExportingThisCSV}
                    disabled={isExportingThisPDF || isExportingThisCSV}
                    onClick={() => handleExportCSV(item)}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs py-1.5"
                  >
                    Export CSV
                  </Button>
                  <span className="text-[10px] text-slate-400 ml-auto">{item.expenseList.length} expense{item.expenseList.length !== 1 ? 's' : ''}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

