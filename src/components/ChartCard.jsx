import React from 'react';
import { Card } from './Card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatPKR } from '../utils/budgetCalculator';

export function ChartCard({ title, data, type = 'pie' }) {
  const COLORS = {
    Needs: '#0F766E', // brand-accent
    Wants: '#8B5CF6', // purple
    Savings: '#16A34A', // green
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload || payload[0];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-bold">{item.name || item.category}</p>
          <p>Spent: <span className="font-semibold text-teal-400">{formatPKR(item.spent || item.value)}</span></p>
          {item.limit !== undefined && (
            <p>Limit: <span className="font-semibold text-slate-300">{formatPKR(item.limit)}</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card header={<h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>}>
      <div className="h-60 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748B'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
              />
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spent" name="Spent" fill="#0F766E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="limit" name="Budget Limit" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
