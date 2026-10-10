import React, { useState } from 'react';
import { Repeat, Plus, Pause, Play, Trash2, Pencil, Check, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Alert } from './Alert';
import { formatPKR } from '../utils/budgetCalculator';

export function RecurringExpensesModal({
  isOpen,
  onClose,
  recurringHook,
  onRefreshExpenses,
  ratios,
}) {
  const {
    recurringExpenses,
    loading,
    error,
    addRecurring,
    updateRecurring,
    togglePause,
    deleteRecurring,
  } = recurringHook;

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('need');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Single source of truth for budget ratios (dynamic from profile / limits)
  const needsRatio = ratios?.needs_ratio ?? 50;
  const wantsRatio = ratios?.wants_ratio ?? 30;
  const savingsRatio = ratios?.savings_ratio ?? 20;

  const categoryOptions = [
    { value: 'need', label: `Needs (${needsRatio}%) — Rent, bills, groceries` },
    { value: 'want', label: `Wants (${wantsRatio}%) — Subscriptions, hobbies` },
    { value: 'saving', label: `Savings (${savingsRatio}%) — Recurring investments` },
  ];

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('need');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setFormError('');
    setIsAdding(false);
    setEditingItem(null);
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setAmount(item.amount);
    const catMap = { needs: 'need', wants: 'want', savings: 'saving' };
    setCategory(catMap[item.category] || item.category);
    setStartDate(item.start_date || new Date().toISOString().slice(0, 10));
    setEndDate(item.end_date || '');
    setIsAdding(true);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        // Editing ONLY updates configuration + syncs current month occurrence in-place.
        // It never creates a duplicate occurrence.
        await updateRecurring(editingItem.id, {
          title: title.trim(),
          amount: Number(amount),
          category,
          startDate,
          endDate: endDate || null,
        });
      } else {
        await addRecurring({
          title: title.trim(),
          amount: Number(amount),
          category,
          startDate,
          endDate: endDate || null,
        });
      }
      if (onRefreshExpenses) onRefreshExpenses();
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Failed to save recurring expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePause = async (item) => {
    try {
      await togglePause(item.id, item.is_active);
      if (onRefreshExpenses) onRefreshExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurring(id);
      if (onRefreshExpenses) onRefreshExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Manage Recurring Expenses"
      footer={
        <div className="flex items-center justify-between w-full">
          {!isAdding ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
            >
              Add Recurring Expense
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel Form
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="danger" title="Error" message={error} />}

        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                {editingItem ? 'Edit Recurring Expense' : 'New Recurring Expense'}
              </h4>
              <span className="text-xs text-brand-muted">Frequency: Monthly</span>
            </div>

            {formError && <Alert variant="danger" title="Validation" message={formError} />}

            <Input
              label="Expense Title"
              placeholder="e.g. Rent, Internet, Phone bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Amount (PKR)"
                type="number"
                placeholder="e.g. 30000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <Select
                label="Category"
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <Input
                label="End Date (Optional)"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                helperText="Leave empty for ongoing monthly recurring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={submitting} icon={Check}>
                {editingItem ? 'Save Changes' : 'Create Recurring'}
              </Button>
            </div>
          </form>
        )}

        {/* Recurring List */}
        <div className="space-y-2.5">
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
            Your Monthly Bills & Subscriptions ({recurringExpenses.length})
          </h4>

          {loading ? (
            <p className="text-xs text-brand-muted italic py-3 text-center">Loading recurring expenses...</p>
          ) : recurringExpenses.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
              <Repeat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No recurring expenses set up</p>
              <p className="text-xs text-brand-muted mt-1">
                Add monthly recurring bills like Rent, Electricity, and Subscriptions to record them automatically each month.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {recurringExpenses.map((item) => {
                const catMap = {
                  needs: `Need (${needsRatio}%)`,
                  need: `Need (${needsRatio}%)`,
                  wants: `Want (${wantsRatio}%)`,
                  want: `Want (${wantsRatio}%)`,
                  savings: `Saving (${savingsRatio}%)`,
                  saving: `Saving (${savingsRatio}%)`,
                };
                const catLabel = catMap[item.category] || item.category;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      item.is_active
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-900 text-sm truncate">{item.title}</h5>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-brand-muted flex-wrap">
                        <span className="font-semibold text-slate-700">{formatPKR(item.amount)}</span>
                        <span>•</span>
                        <span>{catLabel}</span>
                        <span>•</span>
                        <span>Starts: {item.start_date}</span>
                        {item.end_date && <span>(Ends: {item.end_date})</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePause(item)}
                        title={item.is_active ? 'Pause recurring expense' : 'Resume recurring expense'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.is_active
                            ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
                            : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {item.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        title="Edit recurring expense"
                        className="p-1.5 rounded-lg text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="Delete recurring expense"
                        className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
