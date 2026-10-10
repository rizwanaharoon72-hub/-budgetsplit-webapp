/**
 * Pure reusable calculation logic for budget allocations.
 * Defaults:
 * Needs: 50%
 * Wants: 30%
 * Savings: 20%
 */
export function calculateBudget(monthlyIncome, ratios = {}) {
  const income = Number(monthlyIncome) || 0;
  const needsRatio = Number(ratios?.needs_ratio ?? 50);
  const wantsRatio = Number(ratios?.wants_ratio ?? 30);
  const savingsRatio = Number(ratios?.savings_ratio ?? 20);

  return {
    needs: Math.round(income * (needsRatio / 100)),
    wants: Math.round(income * (wantsRatio / 100)),
    savings: Math.round(income * (savingsRatio / 100)),
    needs_ratio: needsRatio,
    wants_ratio: wantsRatio,
    savings_ratio: savingsRatio,
  };
}

/**
 * Format numeric value as PKR currency string (e.g. 100,000 PKR)
 */
export function formatPKR(amount) {
  const val = Math.round(Number(amount) || 0);
  return `${val.toLocaleString('en-PK')} PKR`;
}

