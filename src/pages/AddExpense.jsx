import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Save, ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';

export function AddExpense({ expensesHook }) {
  const navigate = useNavigate();
  const location = useLocation();

  const editingExpense = location.state?.expense || null;
  const isEditMode = !!editingExpense;

  const [title, setTitle] = useState(editingExpense?.title || '');
  const [amount, setAmount] = useState(editingExpense?.amount ? String(editingExpense.amount) : '');
  const [category, setCategory] = useState(editingExpense?.category || 'need');
  const [date, setDate] = useState(
    editingExpense?.date
      ? editingExpense.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(editingExpense.amount ? String(editingExpense.amount) : '');
      setCategory(editingExpense.category || 'need');
      setDate(
        editingExpense.date
          ? editingExpense.date.slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
    }
  }, [editingExpense]);

  const categoryOptions = [
    { value: 'need', label: 'Need (50% Bucket) — Essentials, Rent, Utilities' },
    { value: 'want', label: 'Want (30% Bucket) — Dining, Entertainment, Hobbies' },
    { value: 'saving', label: 'Saving (20% Bucket) — Emergency Fund, Investments' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numericAmount = Number(amount);

    if (!title.trim()) {
      setError('Please enter an expense title/description.');
      return;
    }

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0 PKR.');
      return;
    }

    if (!category) {
      setError('Please select a budget category.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await expensesHook.updateExpense(editingExpense.id, {
          title: title.trim(),
          amount: numericAmount,
          category,
          date,
        });
        setSuccess('Expense updated successfully! Redirecting to Dashboard...');
      } else {
        await expensesHook.addExpense({
          title: title.trim(),
          amount: numericAmount,
          category,
          date,
        });
        setSuccess('Expense recorded successfully! Redirecting to Dashboard...');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || (isEditMode ? 'Failed to update expense.' : 'Failed to add expense.'));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          icon={ArrowLeft}
        >
          Cancel & Back
        </Button>
      </div>

      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {isEditMode ? 'Edit Expense' : 'Record New Expense'}
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          {isEditMode
            ? 'Update details for this expense item and recalculate limits.'
            : 'Add an expense item and assign it to one of your 50/30/20 budget buckets.'}
        </p>
      </div>

      <Card padding="spacious" className="shadow-sm">
        {error && <Alert variant="danger" message={error} className="mb-6" onClose={() => setError('')} />}
        {success && <Alert variant="success" message={success} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Expense Description"
            placeholder="e.g. Monthly Grocery Shopping, Electricity Bill, Internet"
            icon={FileText}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Amount (PKR)"
            type="number"
            placeholder="e.g. 15000"
            prefix="PKR"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
          />

          <Select
            label="Budget Category Bucket"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

          <Input
            label="Expense Date"
            type="date"
            icon={Calendar}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              icon={isEditMode ? Save : PlusCircle}
              fullWidth
            >
              {isEditMode ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
