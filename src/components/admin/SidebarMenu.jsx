import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, PlusCircle, LogOut, X, Landmark,
  Globe, Tag, ChevronDown
} from 'lucide-react';

const SidebarMenu = ({
  activeMenu, onMenuChange,
  provinces, regencies, categories,
  filters, onFilterChange, onResetFilters, onClose,
}) => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'museums', label: 'Kelola Museum', icon: Building2 },
    { key: 'add', label: 'Tambah Museum', icon: PlusCircle },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-xl">
            <Landmark size={22} className="text-emerald-400" />
          </div>
          <div>
            <span className="font-bold text-lg">Museum<span className="text-emerald-400">Nesia</span></span>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Admin Panel</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1">
        {menuItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onMenuChange(key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeMenu === key
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-800" />

      {/* Global Filters */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Filter Global</p>

        {/* Provinsi */}
        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1.5 px-1">
            <Globe size={11} /> Provinsi
          </label>
          <div className="relative">
            <select
              value={filters.provinsi_id || ''}
              onChange={(e) => onFilterChange('provinsi_id', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.nama_provinsi}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Kabupaten */}
        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1.5 px-1">
            <Building2 size={11} /> Kabupaten
          </label>
          <div className="relative">
            <select
              value={filters.kabupaten_id || ''}
              onChange={(e) => onFilterChange('kabupaten_id', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua</option>
              {regencies.map(r => <option key={r.id} value={r.id}>{r.nama_kabupaten}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1.5 px-1">
            <Tag size={11} /> Kategori
          </label>
          <div className="relative">
            <select
              value={filters.kategori_id || ''}
              onChange={(e) => onFilterChange('kategori_id', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Semua</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nama_kategori}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {(filters.provinsi_id || filters.kabupaten_id || filters.kategori_id) && (
          <button
            onClick={onResetFilters}
            className="w-full text-xs text-red-400 hover:text-red-300 font-medium py-1.5 transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarMenu;
