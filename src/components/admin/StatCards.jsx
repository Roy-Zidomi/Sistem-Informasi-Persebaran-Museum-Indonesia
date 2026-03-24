import React from 'react';
import { Building2, Globe, Tag, Landmark, HelpCircle } from 'lucide-react';

const cards = [
  { key: 'total_museum', label: 'Total Museum', icon: Landmark, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { key: 'total_provinsi', label: 'Total Provinsi', icon: Globe, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
  { key: 'total_kabupaten', label: 'Total Kabupaten', icon: Building2, color: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/20' },
  { key: 'total_kategori', label: 'Total Kategori', icon: Tag, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
  { key: 'museum_tanpa_kategori', label: 'Tanpa Kategori', icon: HelpCircle, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
];

const StatCards = ({ stats = {}, loading = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ key, label, icon: Icon, color, shadow }) => (
        <div
          key={key}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-5 shadow-lg ${shadow} transition-all hover:scale-[1.02] hover:shadow-xl`}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-x-4 -translate-y-4" />
          <div className="relative">
            <Icon size={20} className="text-white/80 mb-3" />
            {loading ? (
              <div className="h-8 w-16 bg-white/20 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">{stats[key] ?? 0}</p>
            )}
            <p className="text-white/70 text-xs font-medium mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
