import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Building2, PlusCircle, LogOut, Landmark,
  ChevronDown, Sun, Moon
} from 'lucide-react';

const SidebarMenu = ({
  activeMenu, onMenuChange,
  provinces, regencies, categories,
  filters, onFilterChange, onResetFilters,
}) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'museums', label: 'Kelola Museum', icon: Building2 },
    { key: 'add', label: 'Tambah Museum', icon: PlusCircle },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between h-[4.5rem] px-5 border-b border-slate-200 dark:border-slate-800/90">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-emerald-500/15 dark:bg-emerald-500/20 p-2 rounded-full">
            <Landmark size={22} className="text-emerald-400" />
          </div>
          <span className="font-bold text-2xl leading-none text-slate-900 dark:text-white">Museum<span className="text-emerald-400">Nesia</span></span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1">
        {menuItems.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onMenuChange(key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeMenu === key
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {React.createElement(icon, { size: 18 })}
            {label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-200 dark:bg-slate-800" />

      {/* Global Filters */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest px-1">Filter Global</p>

        {/* Provinsi */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 mb-1.5 px-1 block">
            Provinsi
          </label>
          <div className="relative">
            <select
              value={filters.provinsi_id || ''}
              onChange={(e) => onFilterChange('provinsi_id', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.nama_provinsi}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Kabupaten */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 mb-1.5 px-1 block">
            Kabupaten
          </label>
          <div className="relative">
            <select
              value={filters.kabupaten_id || ''}
              onChange={(e) => onFilterChange('kabupaten_id', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua</option>
              {regencies.map(r => <option key={r.id} value={r.id}>{r.nama_kabupaten}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 mb-1.5 px-1 block">
            Kategori
          </label>
          <div className="relative">
            <select
              value={filters.kategori_id || ''}
              onChange={(e) => onFilterChange('kategori_id', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nama_kategori}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        {(filters.provinsi_id || filters.kabupaten_id || filters.kategori_id) && (
          <button
            onClick={onResetFilters}
            className="w-full text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium py-1.5 transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-indigo-500" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarMenu;
