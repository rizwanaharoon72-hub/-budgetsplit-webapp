import { supabase } from '../lib/supabase';

/**
 * expenseService — CRUD for the `expenses` table.
 * RLS ensures every query is automatically scoped to the authenticated user.
 */
export const expenseService = {
  /**
   * Fetch all expenses for the logged-in user, ordered newest first.
   */
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[expenseService.getExpenses]', error);
      throw new Error("Couldn't load your expenses. Please refresh and try again.");
    }

    return data ?? [];
  },

  /**
   * Insert a new expense row.
   * @param {object} expenseData - { amount, category, note, expense_date }
   *   category must be 'needs' | 'wants' | 'savings'
   *   expense_date must be a date string (YYYY-MM-DD)
   */
  async addExpense({ amount, category, note, expense_date }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: Number(amount),
        category,
        note: note?.trim() || null,
        expense_date: expense_date || new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) {
      console.error('[expenseService.addExpense]', error);
      throw new Error("Couldn't add your expense. Please try again.");
    }

    return data;
  },

  /**
   * Delete an expense by id.
   * RLS enforces the user can only delete their own rows.
   */
  async deleteExpense(id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[expenseService.deleteExpense]', error);
      throw new Error("Couldn't delete the expense. Please try again.");
    }
  },

  /**
   * Update an existing expense (optional — not used in MVP UI but implemented for completeness).
   */
  async updateExpense(id, updates) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[expenseService.updateExpense]', error);
      throw new Error("Couldn't update the expense. Please try again.");
    }

    return data;
  },
};
