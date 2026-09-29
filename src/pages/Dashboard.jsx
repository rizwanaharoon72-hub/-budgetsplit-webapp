import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, Edit3, ArrowRight, ShieldCheck, HeartHandshake, PiggyBank, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BudgetCard } from '../components/BudgetCard';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { ExpenseItem } from '../components/ExpenseItem';
import { Alert } from '../components/Alert';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { formatPKR } from '../utils/budgetCalculator';

export function Dashboard({ profile, limits, expensesHook }) {
  const navigate = useNavigate();
  const { currentMonthExpenses, totals, loading, deleteExpense } = expensesHook;
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentMonthName = new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });

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

  if (loading) {
    return <LoadingState message="Calculating monthly totals..." />;
  }

  const recentExpenses = currentMonthExpenses.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Current Period: {currentMonthName}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 leading-tight">
            Welcome back, <span className="text-brand-accent">{profile?.name || 'User'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Here is your current 50/30/20 budget overview and spending status.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto">
          <Link to="/edit-income" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="md" icon={Edit3} fullWidth>
              Edit Income
            </Button>
          </Link>
          <Link to="/add-expense" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="md" icon={PlusCircle} fullWidth>
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Smart Alert Banners */}
      {totals.overallStatus.status === 'OVER_BUDGET' && (
        <Alert
          variant="danger"
          title="Overall Budget Exceeded"
          message="Your total spending this month has passed your total monthly income budget limit. Review your expenses to stay on track."
        />
      )}
      {totals.overallStatus.status === 'NEAR_LIMIT' && totals.overallStatus.status !== 'OVER_BUDGET' && (
        <Alert
          variant="warning"
          title="Approaching Monthly Limit"
          message="You have used over 80% of your overall monthly budget limit. Watch out for non-essential expenses!"
        />
      )}

      {/* Main Income & Total Budget Summary Bar */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Monthly Income</span>
            <span className="text-xl sm:text-3xl font-extrabold text-white truncate block">
              {formatPKR(profile?.monthlyIncome || 0)}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Total Spent</span>
            <span className="text-xl sm:text-3xl font-extrabold text-teal-400 truncate block">
              {formatPKR(totals.totalSpent)}
            </span>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">Overall Status</span>
              <Badge status={totals.overallStatus} spent={totals.totalSpent} limit={totals.totalBudget} />
            </div>
            <div className="mt-3">
              <ProgressBar
                spent={totals.totalSpent}
                limit={totals.totalBudget}
                statusObj={totals.overallStatus}
                showDetails={false}
                height="h-2.5"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 3 Budget Buckets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <BudgetCard
          category="needs"
          title="Needs (50%)"
          description="Rent, bills, groceries & essentials"
          limit={limits.needs}
          spent={totals.needsSpent}
          statusObj={totals.needsStatus}
        />
        <BudgetCard
          category="wants"
          title="Wants (30%)"
          description="Dining out, shopping & hobbies"
          limit={limits.wants}
          spent={totals.wantsSpent}
          statusObj={totals.wantsStatus}
        />
        <BudgetCard
          category="savings"
          title="Savings (20%)"
          description="Emergency fund & investments"
          limit={limits.savings}
          spent={totals.savingsSpent}
          statusObj={totals.savingsStatus}
        />
      </div>

      {/* Recent Expenses List Section */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Recent Expenses</h3>
            {recentExpenses.length > 0 && (
              <Link to="/breakdown" className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1">
                View Breakdown <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        }
      >
        {recentExpenses.length === 0 ? (
          <EmptyState
            title="No expenses recorded yet"
            description="Start building your monthly history by recording your first expense."
            actionLabel="Add First Expense"
            onAction={() => navigate('/add-expense')}
            icon={Wallet}
          />
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {recentExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={(exp) => navigate('/add-expense', { state: { expense: exp } })}
                onDelete={(exp) => setDeletingExpense(exp)}
              />
            ))}
          </div>
        )}
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
          Are you sure you want to delete <strong className="text-slate-900">{deletingExpense?.title}</strong> ({formatPKR(deletingExpense?.amount)})? All dependent budget totals and progress bars will update immediately.
        </p>
      </Modal>
    </div>
  );
}
