/**
 * Reusable status determination logic.
 * spent >= limit (100%) -> OVER_BUDGET
 * spent >= 80% limit -> NEAR_LIMIT
 * else -> ON_TRACK
 */
export function getBudgetStatus(spent, limit) {
  const numericSpent = Number(spent) || 0;
  const numericLimit = Number(limit) || 0;

  if (numericLimit <= 0) {
    return {
      status: 'ON_TRACK',
      label: 'On Track',
      color: '#16A34A',
      badgeClass: 'bg-green-100 text-green-800 border-green-300',
      progressClass: 'bg-green-600',
    };
  }

  const percent = (numericSpent / numericLimit) * 100;

  if (percent >= 100) {
    return {
      status: 'OVER_BUDGET',
      label: 'Over Budget',
      color: '#DC2626',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      progressClass: 'bg-red-600',
    };
  }

  if (percent >= 80) {
    return {
      status: 'NEAR_LIMIT',
      label: 'Near Limit',
      color: '#F59E0B',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      progressClass: 'bg-amber-500',
    };
  }

  return {
    status: 'ON_TRACK',
    label: 'On Track',
    color: '#16A34A',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    progressClass: 'bg-green-600',
  };
}
