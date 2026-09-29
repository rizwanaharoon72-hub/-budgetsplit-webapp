import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, PiggyBank, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { ChartCard } from '../components/ChartCard';
import { ExpenseItem } from '../components/ExpenseItem';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { formatPKR } from '../utils/budgetCalculator';

export function CategoryBreakdown({ limits, expensesHook }) {
  const navigate = useNavigate();
  const { currentMonthExpenses, totals, loading, deleteExpense } = expensesHook;
  const [chartType, setChartType] = useState('pie');
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (loading) {
    return <LoadingState message="Analyzing category breakdowns..." />;
  }

  const pieChartData = [
    { name: 'Needs', value: totals.needsSpent || 0, limit: limits.needs },
    { name: 'Wants', value: totals.wantsSpent || 0, limit: limits.wants },
    { name: 'Savings', value: totals.savingsSpent || 0, limit: limits.savings },
  ];

  const barChartData = [
    { name: 'Needs (50%)', spent: totals.needsSpent, limit: limits.needs },
    { name: 'Wants (30%)', spent: totals.wantsSpent, limit: limits.wants },
    { name: 'Savings (20%)', spent: totals.savingsSpent, limit: limits.savings },
  ];

  const categories = [
    {
      key: 'need',
      title: 'Needs',
      rule: '50% of Income',
      spent: totals.needsSpent,
      limit: limits.needs,
      statusObj: totals.needsStatus,
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50',
    },
    {
      key: 'want',
      title: 'Wants',
      rule: '30% of Income',
      spent: totals.wantsSpent,
      limit: limits.wants,
      statusObj: totals.wantsStatus,
      icon: HeartHandshake,
      color: 'text-purple-700 bg-purple-50',
    },
    {
      key: 'saving',
      title: 'Savings',
      rule: '20% of Income',
      spent: totals.savingsSpent,
      limit: limits.savings,
      statusObj: totals.savingsStatus,
      icon: PiggyBank,
      color: 'text-emerald-700 bg-emerald-50',
    },
  ];

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      setDeleteLoading(true);
      await deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Category Breakdown</h1>
        <p className="text-sm text-brand-muted mt-1">
          Detailed breakdown of your spending against the 50/30/20 rule.
        </p>
      </div>

      {/* Chart Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">Visual Spending Breakdown</h2>
          <div className="flex items-center bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                chartType === 'pie' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" /> Donut Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                chartType === 'bar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Bar Comparison
            </button>
          </div>
        </div>

        <ChartCard
          title={chartType === 'pie' ? 'Category Spending Distribution' : 'Spent vs Limit Comparison (PKR)'}
          data={chartType === 'pie' ? pieChartData : barChartData}
          type={chartType}
        />
      </div>

      {/* Category Numerical Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const remaining = cat.limit - cat.spent;
          const percentage = cat.limit > 0 ? ((cat.spent / cat.limit) * 100).toFixed(1) : 0;

          return (
            <Card key={cat.key} padding="normal">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${cat.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cat.title}</h3>
                      <span className="text-xs font-medium text-brand-muted">{cat.rule}</span>
                    </div>
                  </div>
                  <Badge status={cat.statusObj} spent={cat.spent} limit={cat.limit} />
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-muted">Spent:</span>
                    <span className="font-bold text-slate-900">{formatPKR(cat.spent)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-muted">Limit:</span>
                    <span className="font-semibold text-slate-700">{formatPKR(cat.limit)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-brand-muted">Used:</span>
                    <span className="font-bold text-slate-900">{percentage}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-muted">Remaining:</span>
                    <span className={`font-bold ${remaining < 0 ? 'text-brand-danger' : 'text-slate-800'}`}>
                      {formatPKR(remaining)}
                    </span>
                  </div>
                </div>

                <ProgressBar spent={cat.spent} limit={cat.limit} statusObj={cat.statusObj} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Category Expenses Lists */}
      <Card header={<h3 className="font-bold text-slate-900">Expenses by Category</h3>}>
        <div className="space-y-6">
          {categories.map((cat) => {
            const catExpenses = currentMonthExpenses.filter((e) => e.category === cat.key);
            return (
              <div key={cat.key} className="space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm flex items-center justify-between border-b pb-2">
                  <span className="capitalize">{cat.title} Expenses ({catExpenses.length})</span>
                  <span className="text-xs text-brand-muted">Total: {formatPKR(cat.spent)}</span>
                </h4>

                {catExpenses.length === 0 ? (
                  <p className="text-xs text-brand-muted italic py-2">
                    No expenses recorded in {cat.title} category yet (0 PKR spent / full limit remaining).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {catExpenses.map((expense) => (
                      <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        onEdit={(exp) => navigate('/add-expense', { state: { expense: exp } })}
                        onDelete={(exp) => setDeletingExpense(exp)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        title="Confirm Expense Deletion"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeletingExpense(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteLoading}
              onClick={handleConfirmDelete}
            >
              Delete Expense
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong className="text-slate-900">{deletingExpense?.title}</strong> ({formatPKR(deletingExpense?.amount)})?
        </p>
      </Modal>
    </div>
  );
}
