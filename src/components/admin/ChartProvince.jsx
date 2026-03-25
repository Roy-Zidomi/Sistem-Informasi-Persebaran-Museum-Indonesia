import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MUTED_BAR_COLORS = [
  '#2DD4BF',
  '#22D3EE',
  '#38BDF8',
  '#60A5FA',
  '#818CF8',
  '#A78BFA',
  '#34D399',
  '#93C5FD',
];

const ChartProvince = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Museum per Provinsi</h3>
      <p className="text-xs text-slate-400 mb-4">Distribusi jumlah museum berdasarkan provinsi</p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b', border: '1px solid #334155',
                borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: 12 }}
              itemStyle={{ color: '#cbd5e1', fontSize: 12 }}
              formatter={(value) => [`${value} museum`, 'Jumlah']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={MUTED_BAR_COLORS[index % MUTED_BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartProvince;
