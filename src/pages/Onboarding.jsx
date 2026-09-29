import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, ShieldCheck, HeartHandshake, PiggyBank, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { calculateBudget, formatPKR } from '../utils/budgetCalculator';

export function Onboarding({ user, onComplete }) {
  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const numericIncome = Number(income) || 0;
  const limits = calculateBudget(numericIncome);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!income || isNaN(numericIncome) || numericIncome <= 0) {
      setError('Please enter a valid monthly income greater than 0 PKR.');
      return;
    }

    try {
      setLoading(true);
      await onComplete({ name: name.trim(), monthlyIncome: numericIncome });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save onboarding details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center px-3 sm:px-4 py-8 sm:py-12 max-w-full overflow-x-hidden">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Step 1 of 1: Initial Setup
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Set Up Your Monthly Budget</h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-md mx-auto">
            Enter your total monthly income in PKR. We will automatically calculate your 50/30/20 spending limits.
          </p>
        </div>

        <Card padding="spacious" className="shadow-lg">
          {error && <Alert variant="danger" message={error} className="mb-6" onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <Input
              label="Your Name"
              placeholder="e.g. Ali Ahmed"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Monthly Income (PKR)"
              type="number"
              placeholder="e.g. 150000"
              prefix="PKR"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              helperText="Enter net monthly income after taxes"
              required
              min="1"
            />

            {/* Live 50/30/20 Calculation Preview */}
            {numericIncome > 0 && (
              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Automatic 50/30/20 Allocation:
                </h4>

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

            <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={ArrowRight} fullWidth>
              Save & View Dashboard
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
