/**
 * Pure reusable calculation logic for 50/30/20 budget allocations.
 * Needs: 50%
 * Wants: 30%
 * Savings: 20%
 */
export function calculateBudget(monthlyIncome) {
  const income = Number(monthlyIncome) || 0;
  return {
    needs: Math.round(income * 0.5),
    wants: Math.round(income * 0.3),
    savings: Math.round(income * 0.2),
  };
}

/**
 * Format numeric value as PKR currency string (e.g. 100,000 PKR or Rs. 100,000)
 */
export function formatPKR(amount) {
  const val = Math.round(Number(amount) || 0);
  return `${val.toLocaleString('en-PK')} PKR`;
}
