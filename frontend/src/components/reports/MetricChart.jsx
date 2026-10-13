import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

const MetricChart = ({ data = [], xKey = 'name', yKey = 'value', title, colors = [] }) => {
  const defaultColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#64748b'];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        No metrics data available for chart visualization
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      {title && (
        <h4 className="font-heading font-bold text-sm text-slate-900 mb-4">
          {title}
        </h4>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={xKey}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
            />
            <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length] || defaultColors[index % defaultColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;
