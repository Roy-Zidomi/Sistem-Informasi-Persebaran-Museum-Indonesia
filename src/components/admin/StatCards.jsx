import React from 'react';

const cards = [
  { key: 'total_museum', label: 'Total Museum', accent: '#2DD4BF' },
  { key: 'total_provinsi', label: 'Total Provinsi', accent: '#60A5FA' },
  { key: 'total_kabupaten', label: 'Total Kabupaten', accent: '#818CF8' },
  { key: 'total_kategori', label: 'Total Kategori', accent: '#A78BFA' },
  { key: 'museum_tanpa_kategori', label: 'Tanpa Kategori', accent: '#38BDF8' },
];

const StatCards = ({ stats = {}, loading = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ key, label, accent }) => (
        <div
          key={key}
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: `${accent}33` }}
        >
          <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: `${accent}AA` }} />
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-x-4 -translate-y-4" style={{ backgroundColor: `${accent}22` }} />
          <div className="relative">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats[key] ?? 0}</p>
            )}
            <p className="text-xs font-medium mt-1" style={{ color: `${accent}DD` }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
