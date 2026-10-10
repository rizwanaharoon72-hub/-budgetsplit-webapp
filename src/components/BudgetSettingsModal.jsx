import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';

export function BudgetSettingsModal({ isOpen, onClose, ratios, onSaveRatios, onResetRatios }) {
  const [needs, setNeeds] = useState(ratios?.needs_ratio ?? 50);
  const [wants, setWants] = useState(ratios?.wants_ratio ?? 30);
  const [savings, setSavings] = useState(ratios?.savings_ratio ?? 20);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNeeds(ratios?.needs_ratio ?? 50);
      setWants(ratios?.wants_ratio ?? 30);
      setSavings(ratios?.savings_ratio ?? 20);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, ratios]);

  const numNeeds = Number(needs) || 0;
  const numWants = Number(wants) || 0;
  const numSavings = Number(savings) || 0;
  const total = Math.round((numNeeds + numWants + numSavings) * 100) / 100;
  const isValidTotal = total === 100;
  const isNonNegative = numNeeds >= 0 && numWants >= 0 && numSavings >= 0;

  const handleSave = async (e) => {
    e?.preventDefault();
    setSuccessMsg('');

    if (!isNonNegative) {
      setErrorMsg('Percentage values cannot be negative.');
      return;
    }

    if (!isValidTotal) {
      setErrorMsg(`The percentages must add up to exactly 100%. Currently: ${total}%`);
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      await onSaveRatios({
        needs_ratio: numNeeds,
        wants_ratio: numWants,
        savings_ratio: numSavings,
      });
      setSuccessMsg('Budget ratios updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update budget ratios.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await onResetRatios();
      setNeeds(50);
      setWants(30);
      setSavings(20);
      setSuccessMsg('Reset to default 50/30/20 ratio!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset ratios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Budget Ratios"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving}
            icon={RotateCcw}
            className="text-slate-600 hover:text-slate-900 border-slate-300"
          >
            Reset 50/30/20
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={saving}
              disabled={saving || !isValidTotal || !isNonNegative}
              icon={Check}
            >
              Save Ratios
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        <p className="text-xs sm:text-sm text-slate-600">
          Customize how your monthly income is allocated across Needs, Wants, and Savings. Total percentage must equal 100%.
        </p>

        {errorMsg && (
          <Alert variant="danger" title="Validation Error" message={errorMsg} />
        )}

        {successMsg && (
          <Alert variant="success" title="Success" message={successMsg} />
        )}

        <div className="space-y-3 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
          <Input
            label="Needs % (Rent, utilities, groceries)"
            type="number"
            min="0"
            max="100"
            step="1"
            value={needs}
            onChange={(e) => {
              setNeeds(e.target.value);
              setErrorMsg('');
            }}
            placeholder="50"
            required
          />

          <Input
            label="Wants % (Dining out, entertainment, shopping)"
            type="number"
            min="0"
            max="100"
            step="1"
            value={wants}
            onChange={(e) => {
              setWants(e.target.value);
              setErrorMsg('');
            }}
            placeholder="30"
            required
          />

          <Input
            label="Savings % (Emergency fund, investments)"
            type="number"
            min="0"
            max="100"
            step="1"
            value={savings}
            onChange={(e) => {
              setSavings(e.target.value);
              setErrorMsg('');
            }}
            placeholder="20"
            required
          />
        </div>

        {/* Total Summary Indicator */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
            isValidTotal
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {!isValidTotal && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />}
            <span>Total Allocation:</span>
          </div>
          <span className="font-bold text-sm sm:text-base">{total}% / 100%</span>
        </div>
      </form>
    </Modal>
  );
}
