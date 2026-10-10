import { supabase } from '../lib/supabase';

/**
 * Helper to compute list of YYYY-MM strings between startMonth and endMonth inclusive.
 */
function getMonthRange(startMonthStr, endMonthStr) {
  const months = [];
  let [year, month] = startMonthStr.split('-').map(Number);
  const [endYear, endMonth] = endMonthStr.split('-').map(Number);

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const formattedMonth = String(month).padStart(2, '0');
    months.push(`${year}-${formattedMonth}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return months;
}

/**
 * Generate exact ISO date string YYYY-MM-DD for a target month matching start_date's day of month.
 */
function buildExpenseDate(yearMonthStr, startDateStr) {
  const [year, month] = yearMonthStr.split('-').map(Number);
  const origDay = startDateStr ? parseInt(startDateStr.slice(8, 10), 10) || 1 : 1;
  // Get max days in target month
  const maxDays = new Date(year, month, 0).getDate();
  const day = Math.min(origDay, maxDays);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// In-memory mutex to prevent concurrent execution of occurrence processing
let isProcessingOccurrences = false;

export const recurringExpenseService = {
  /**
   * Fetch all recurring expenses for the current user.
   */
  async getRecurringExpenses() {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      if (error.code === '42P01') return [];
      console.error('[recurringExpenseService.getRecurringExpenses]', error);
      throw new Error("Couldn't fetch recurring expenses.");
    }
    return data || [];
  },

  /**
   * Add a new recurring expense record.
   */
  async addRecurringExpense(payload) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated.');

    const catMap = { need: 'needs', want: 'wants', saving: 'savings' };
    const category = catMap[payload.category] ?? payload.category;

    const newRow = {
      user_id: user.id,
      title: payload.title,
      amount: Number(payload.amount),
      category,
      start_date: payload.startDate || new Date().toISOString().slice(0, 10),
      end_date: payload.endDate || null,
      frequency: 'monthly',
      is_active: payload.isActive !== undefined ? payload.isActive : true,
    };

    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert([newRow])
      .select()
      .single();

    if (error) {
      console.error('[recurringExpenseService.addRecurringExpense]', error);
      throw new Error("Couldn't create recurring expense.");
    }
    return data;
  },

  /**
   * Update an existing recurring expense.
   * IDEMPOTENCY GUARANTEE:
   * Editing ONLY updates the recurring expense configuration.
   * If an expense record was already generated for this recurring bill in the current month,
   * that single occurrence is updated in-place (amount, category, note) to match the new settings.
   * It NEVER creates an additional current-month expense.
   */
  async updateRecurringExpense(id, payload) {
    const catMap = { need: 'needs', want: 'wants', saving: 'savings' };
    const updates = {};
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.amount !== undefined) updates.amount = Number(payload.amount);
    if (payload.category !== undefined) {
      updates.category = catMap[payload.category] ?? payload.category;
    }
    if (payload.startDate !== undefined) updates.start_date = payload.startDate;
    if (payload.endDate !== undefined) updates.end_date = payload.endDate || null;
    if (payload.isActive !== undefined) updates.is_active = payload.isActive;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[recurringExpenseService.updateRecurringExpense]', error);
      throw new Error("Couldn't update recurring expense.");
    }

    // Synchronize the current month's generated expense in-place if it exists
    try {
      const currentIsoMonth = new Date().toISOString().slice(0, 7);
      const { data: linkedExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('recurring_id', id);

      const currentMonthOccurrence = linkedExpenses?.find(
        (exp) => exp.expense_date?.slice(0, 7) === currentIsoMonth
      );

      if (currentMonthOccurrence) {
        const expUpdates = {};
        if (payload.amount !== undefined) expUpdates.amount = Number(payload.amount);
        if (payload.category !== undefined) {
          expUpdates.category = catMap[payload.category] ?? payload.category;
        }
        if (payload.title !== undefined) expUpdates.note = `${payload.title} (Recurring)`;
        if (payload.startDate !== undefined) {
          expUpdates.expense_date = buildExpenseDate(currentIsoMonth, payload.startDate);
        }

        if (Object.keys(expUpdates).length > 0) {
          await supabase
            .from('expenses')
            .update(expUpdates)
            .eq('id', currentMonthOccurrence.id);
        }
      }
    } catch (syncErr) {
      console.warn('[recurringExpenseService] Could not sync current-month occurrence:', syncErr);
    }

    return data;
  },

  /**
   * Toggle active state.
   */
  async toggleActive(id, currentActive) {
    return this.updateRecurringExpense(id, { isActive: !currentActive });
  },

  /**
   * Delete a recurring expense.
   */
  async deleteRecurringExpense(id) {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[recurringExpenseService.deleteRecurringExpense]', error);
      throw new Error("Couldn't delete recurring expense.");
    }
  },

  /**
   * IDEMPOTENT GENERATION:
   * Scans active recurring expenses and creates missing monthly expense entries up to current month.
   * At most ONE normal expense is generated per (recurring_expense_id + YYYY-MM).
   */
  async processRecurringOccurrences() {
    if (isProcessingOccurrences) {
      return [];
    }

    isProcessingOccurrences = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let recurringList = [];
      try {
        const { data, error } = await supabase
          .from('recurring_expenses')
          .select('*')
          .eq('is_active', true);
        if (error) return [];
        recurringList = data || [];
      } catch {
        return [];
      }

      if (!recurringList.length) return [];

      const currentIsoMonth = new Date().toISOString().slice(0, 7);
      const newGeneratedExpenses = [];

      // Fetch all existing expenses for this user to ensure strict idempotency
      let existingForUser = [];
      try {
        const { data: exData } = await supabase
          .from('expenses')
          .select('id, expense_date, recurring_id, note')
          .eq('user_id', user.id);
        existingForUser = exData || [];
      } catch (exErr) {
        console.warn('[recurringExpenseService] Could not fetch existing expenses:', exErr);
      }

      for (const rec of recurringList) {
        const startMonth = rec.start_date ? rec.start_date.slice(0, 7) : currentIsoMonth;

        // If start month is in the future, skip for now
        if (startMonth > currentIsoMonth) continue;

        // Cap end month if end_date exists
        let maxMonth = currentIsoMonth;
        if (rec.end_date && rec.end_date.slice(0, 7) < currentIsoMonth) {
          maxMonth = rec.end_date.slice(0, 7);
        }

        // Determine candidate target months
        const allMonths = getMonthRange(startMonth, maxMonth);
        const lastGen = rec.last_generated_month || '';

        // Pending months are any candidate months that might need checking
        const candidateMonths = allMonths.filter((m) => m >= startMonth && m <= maxMonth);
        if (!candidateMonths.length) continue;

        let latestGeneratedMonth = lastGen;

        for (const targetMonth of candidateMonths) {
          // Strict deduplication check:
          // Check if an occurrence already exists for this recurring bill + target month
          const alreadyExists = existingForUser.some((exp) => {
            const expMonth = exp.expense_date?.slice(0, 7);
            if (expMonth !== targetMonth) return false;

            // Match by recurring_id
            if (exp.recurring_id && exp.recurring_id === rec.id) return true;

            // Fallback match: title + (Recurring) note format
            if (
              !exp.recurring_id &&
              exp.note &&
              exp.note.toLowerCase().startsWith(rec.title.toLowerCase()) &&
              exp.note.toLowerCase().includes('(recurring)')
            ) {
              return true;
            }

            return false;
          });

          if (!alreadyExists) {
            const expDate = buildExpenseDate(targetMonth, rec.start_date);
            const expenseInsert = {
              user_id: user.id,
              amount: Number(rec.amount),
              category: rec.category,
              note: `${rec.title} (Recurring)`,
              expense_date: expDate,
              recurring_id: rec.id,
            };

            const { data: inserted, error: insErr } = await supabase
              .from('expenses')
              .insert([expenseInsert])
              .select()
              .single();

            if (!insErr && inserted) {
              newGeneratedExpenses.push(inserted);
              // Push to local memory to prevent duplicate in current iteration
              existingForUser.push(inserted);
            } else if (insErr && insErr.code === '23505') {
              // PostgreSQL unique violation: safely treat as already generated
              console.log('[recurringExpenseService] Occurrence already exists (unique constraint).');
            }
          }

          if (targetMonth > latestGeneratedMonth) {
            latestGeneratedMonth = targetMonth;
          }
        }

        // Update last_generated_month on recurring_expense row
        if (latestGeneratedMonth && latestGeneratedMonth > (rec.last_generated_month || '')) {
          await supabase
            .from('recurring_expenses')
            .update({ last_generated_month: latestGeneratedMonth })
            .eq('id', rec.id);
        }
      }

      return newGeneratedExpenses;
    } finally {
      isProcessingOccurrences = false;
    }
  },
};
