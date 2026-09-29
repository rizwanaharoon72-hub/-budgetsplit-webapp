import React from 'react';

export function ProgressBar({ spent, limit, statusObj, showDetails = true, height = 'h-3' }) {
  const numericSpent = Number(spent) || 0;
  const numericLimit = Number(limit) || 0;
  const percentage = numericLimit > 0 ? Math.min(Math.round((numericSpent / numericLimit) * 100), 100) : 0;
  const actualPercentRaw = numericLimit > 0 ? ((numericSpent / numericLimit) * 100).toFixed(1) : 0;

  const progressColor = statusObj?.progressClass || (
    percentage >= 100 ? 'bg-red-600' : percentage >= 80 ? 'bg-amber-500' : 'bg-green-600'
  );

  return (
    <div className="w-full flex flex-col gap-1.5">
      {showDetails && (
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Usage ({actualPercentRaw}%)</span>
          <span className="font-semibold">{percentage}% of limit</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${progressColor} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
