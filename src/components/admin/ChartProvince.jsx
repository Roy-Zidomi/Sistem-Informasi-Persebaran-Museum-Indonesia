import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#EF4444', '#6366F1'];

const ChartProvince = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Museum per Provinsi</h3>
      <p className="text-xs text-slate-400 mb-4">Distribusi jumlah museum berdasarkan provinsi</p>
      <div className="h-72">
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
              itemStyle={{ color: '#10b981', fontSize: 12 }}
              formatter={(value) => [`${value} museum`, 'Jumlah']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartProvince;
