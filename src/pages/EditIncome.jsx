import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck, HeartHandshake, PiggyBank, RefreshCw } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { calculateBudget, formatPKR } from '../utils/budgetCalculator';

export function EditIncome({ profile, onUpdateIncome }) {
  const [income, setIncome] = useState(profile?.monthlyIncome || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const numericIncome = Number(income) || 0;
  const limits = calculateBudget(numericIncome);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!income || isNaN(numericIncome) || numericIncome <= 0) {
      setError('Please enter a valid monthly income greater than 0 PKR.');
      return;
    }

    try {
      setLoading(true);
      await onUpdateIncome(numericIncome);
      setSuccess('Monthly income updated and limits recalculated! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update income.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 max-w-full overflow-x-hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          icon={ArrowLeft}
        >
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Update Monthly Income</h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Adjusting your income will immediately recalculate your 50/30/20 category budget limits.
        </p>
      </div>

      <Card padding="spacious" className="shadow-sm">
        {error && <Alert variant="danger" message={error} className="mb-6" onClose={() => setError('')} />}
        {success && <Alert variant="success" message={success} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <Input
            label="Monthly Income (PKR)"
            type="number"
            placeholder="e.g. 180000"
            prefix="PKR"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            helperText={`Current income: ${formatPKR(profile?.monthlyIncome || 0)}`}
            required
            min="1"
          />

          {/* Recalculation Preview */}
          {numericIncome > 0 && (
            <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>New Recalculated 50/30/20 Allocations:</span>
              </div>

              <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2 text-center">
                <div className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-teal-700 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold">Needs (50%)</span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{formatPKR(limits.needs)}</p>
                </div>

                <div className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-purple-700 mb-1">
                    <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold">Wants (30%)</span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{formatPKR(limits.wants)}</p>
                </div>

                <div className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
                    <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold">Savings (20%)</span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{formatPKR(limits.savings)}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={Save}
            fullWidth
          >
            Save & Recalculate Limits
          </Button>
        </form>
      </Card>
    </div>
  );
}
