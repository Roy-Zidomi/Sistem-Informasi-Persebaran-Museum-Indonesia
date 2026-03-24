import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartTopRegency = ({ data = [], loading = false }) => {
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
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Top Kabupaten/Kota</h3>
      <p className="text-xs text-slate-400 mb-4">Kabupaten dengan jumlah museum terbanyak</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={130}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b', border: '1px solid #334155',
                borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: 12 }}
              itemStyle={{ color: '#8b5cf6', fontSize: 12 }}
              formatter={(value) => [`${value} museum`, 'Jumlah']}
            />
            <Bar
              dataKey="value"
              fill="url(#regencyGradient)"
              radius={[0, 6, 6, 0]}
              barSize={18}
            />
            <defs>
              <linearGradient id="regencyGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartTopRegency;
