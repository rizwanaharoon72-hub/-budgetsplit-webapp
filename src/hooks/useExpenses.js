import { useState, useEffect, useCallback, useMemo } from 'react';
import { expenseService } from '../services/expenseService';
import { getBudgetStatus } from '../utils/getBudgetStatus';

/**
 * useExpenses — manages expenses from Supabase for the authenticated user.
 *
 * Category mapping note:
 *   - DB stores: 'needs' | 'wants' | 'savings'
 *   - The existing UI used:  'need' | 'want' | 'saving'
 *   This hook normalises DB rows → UI format on read, and UI → DB format on write.
 */

// Normalise a DB expense row so existing components don't need changes
function toUIExpense(row) {
  const catMap = { needs: 'need', wants: 'want', savings: 'saving' };
  return {
    ...row,
    // UI-facing fields
    category: catMap[row.category] ?? row.category,
    title: row.note || 'Expense', // DB uses `note` for description; UI uses `title`
    date: row.expense_date,       // DB column → UI field name
    month: row.expense_date?.slice(0, 7) ?? '',
  };
}

// Normalise a UI expense submission → DB insert/update format
function toDBExpense({ title, amount, category, date }) {
  const catMap = { need: 'needs', want: 'wants', saving: 'savings' };
  return {
    amount: Number(amount),
    category: catMap[category] ?? category,
    note: title,
    expense_date: date ? date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

export function useExpenses(limits = { needs: 0, wants: 0, savings: 0 }, userId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExpenses = useCallback(async () => {
    if (!userId) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const rows = await expenseService.getExpenses();
      setExpenses(rows.map(toUIExpense));
    } catch (err) {
      console.error('[useExpenses] loadExpenses error:', err);
      setError(err.message || "Couldn't load your expenses.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = async (expenseData) => {
    try {
      setError(null);
      const dbData = toDBExpense(expenseData);
      const newRow = await expenseService.addExpense(dbData);
      const newUI = toUIExpense(newRow);
      // Prepend to existing list (optimistic local update)
      setExpenses((prev) => [newUI, ...prev]);
      return newUI;
    } catch (err) {
      console.error('[useExpenses] addExpense error:', err);
      setError(err.message || "Couldn't add expense.");
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      setError(null);
      const dbData = toDBExpense(expenseData);
      const updatedRow = await expenseService.updateExpense(id, dbData);
      const updatedUI = toUIExpense(updatedRow);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updatedUI : e)));
      return updatedUI;
    } catch (err) {
      console.error('[useExpenses] updateExpense error:', err);
      setError(err.message || "Couldn't update expense.");
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      setError(null);
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('[useExpenses] deleteExpense error:', err);
      setError(err.message || "Couldn't delete expense.");
      throw err;
    }
  };

  // ── Derived calculations (unchanged from MVP logic) ────────────────────────
  const currentIsoMonth = new Date().toISOString().slice(0, 7);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => !e.month || e.month === currentIsoMonth);
  }, [expenses, currentIsoMonth]);

  const totals = useMemo(() => {
    let needsSpent = 0;
    let wantsSpent = 0;
    let savingsSpent = 0;

    currentMonthExpenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      if (exp.category === 'need') needsSpent += amt;
      else if (exp.category === 'want') wantsSpent += amt;
      else if (exp.category === 'saving') savingsSpent += amt;
    });

    const totalSpent = needsSpent + wantsSpent + savingsSpent;
    const totalBudget = (limits.needs || 0) + (limits.wants || 0) + (limits.savings || 0);

    return {
      needsSpent,
      needsRemaining: (limits.needs || 0) - needsSpent,
      needsStatus: getBudgetStatus(needsSpent, limits.needs || 0),

      wantsSpent,
      wantsRemaining: (limits.wants || 0) - wantsSpent,
      wantsStatus: getBudgetStatus(wantsSpent, limits.wants || 0),

      savingsSpent,
      savingsRemaining: (limits.savings || 0) - savingsSpent,
      savingsStatus: getBudgetStatus(savingsSpent, limits.savings || 0),

      totalSpent,
      totalBudget,
      totalRemaining: totalBudget - totalSpent,
      overallStatus: getBudgetStatus(totalSpent, totalBudget),
    };
  }, [currentMonthExpenses, limits]);

  return {
    expenses,
    currentMonthExpenses,
    totals,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses: loadExpenses,
  };
}
