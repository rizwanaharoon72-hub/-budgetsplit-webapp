import { useState, useEffect, useCallback } from 'react';
import { recurringExpenseService } from '../services/recurringExpenseService';

export function useRecurringExpenses(userId, onOccurrencesGenerated) {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecurringExpenses = useCallback(async () => {
    if (!userId) {
      setRecurringExpenses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // First process any pending monthly occurrences automatically (idempotent)
      const generated = await recurringExpenseService.processRecurringOccurrences();
      if (generated && generated.length > 0 && onOccurrencesGenerated) {
        onOccurrencesGenerated();
      }

      // Load recurring expenses list
      const data = await recurringExpenseService.getRecurringExpenses();
      setRecurringExpenses(data);
    } catch (err) {
      console.error('[useRecurringExpenses] load error:', err);
      setError(err.message || 'Could not load recurring expenses.');
    } finally {
      setLoading(false);
    }
  }, [userId, onOccurrencesGenerated]);

  useEffect(() => {
    loadRecurringExpenses();
  }, [loadRecurringExpenses]);

  const addRecurring = async (data) => {
    try {
      setError(null);
      await recurringExpenseService.addRecurringExpense(data);
      // Process occurrence for new recurring expense if start_date <= current month
      const generated = await recurringExpenseService.processRecurringOccurrences();
      if (generated && generated.length > 0 && onOccurrencesGenerated) {
        onOccurrencesGenerated();
      }
      // Re-fetch recurring expenses list with updated last_generated_month
      const refreshed = await recurringExpenseService.getRecurringExpenses();
      setRecurringExpenses(refreshed);
      return refreshed[0];
    } catch (err) {
      console.error('[useRecurringExpenses] add error:', err);
      setError(err.message || 'Failed to add recurring expense.');
      throw err;
    }
  };

  const updateRecurring = async (id, updates) => {
    try {
      setError(null);
      const updated = await recurringExpenseService.updateRecurringExpense(id, updates);
      setRecurringExpenses((prev) => prev.map((r) => (r.id === id ? updated : r)));
      // Inform caller to refresh regular expenses list if current month occurrence was synced
      if (onOccurrencesGenerated) {
        onOccurrencesGenerated();
      }
      return updated;
    } catch (err) {
      console.error('[useRecurringExpenses] update error:', err);
      setError(err.message || 'Failed to update recurring expense.');
      throw err;
    }
  };

  const togglePause = async (id, currentIsActive) => {
    try {
      setError(null);
      const updated = await recurringExpenseService.toggleActive(id, currentIsActive);
      setRecurringExpenses((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    } catch (err) {
      console.error('[useRecurringExpenses] togglePause error:', err);
      setError(err.message || 'Failed to toggle status.');
      throw err;
    }
  };

  const deleteRecurring = async (id) => {
    try {
      setError(null);
      await recurringExpenseService.deleteRecurringExpense(id);
      setRecurringExpenses((prev) => prev.filter((r) => r.id !== id));
      if (onOccurrencesGenerated) {
        onOccurrencesGenerated();
      }
    } catch (err) {
      console.error('[useRecurringExpenses] delete error:', err);
      setError(err.message || 'Failed to delete recurring expense.');
      throw err;
    }
  };

  return {
    recurringExpenses,
    loading,
    error,
    addRecurring,
    updateRecurring,
    togglePause,
    deleteRecurring,
    refreshRecurring: loadRecurringExpenses,
  };
}
