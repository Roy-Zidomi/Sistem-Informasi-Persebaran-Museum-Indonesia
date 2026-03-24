import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, MapPin, Navigation, RotateCcw, X,
  ChevronDown, Locate, Globe, Building2, Tag
} from 'lucide-react';
import { CATEGORY_COLORS, DEFAULT_COLOR } from './CategoryMarker';

const FilterPanel = ({
  provinces = [],
  regencies = [],
  categories = [],
  selectedProvince,
  selectedRegency,
  selectedCategory,
  searchQuery,
  nearbyMode,
  nearbyRadius,
  onProvinceChange,
  onRegencyChange,
  onCategoryChange,
  onSearch,
  onNearby,
  onRadiusChange,
  onResetNearby,
  onResetFilters,
  onClose,
  totalResults,
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [radiusInput, setRadiusInput] = useState(nearbyRadius || 50);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    // Debounce: auto-search setelah ketik
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => {
      onSearch(e.target.value);
    }, 500);
  };

  const handleRadiusChange = (value) => {
    setRadiusInput(value);
    onRadiusChange(parseFloat(value) || 50);
  };

  const hasActiveFilters = selectedProvince || selectedRegency || selectedCategory || searchQuery || nearbyMode;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-emerald-500" />
          <h2 className="font-bold text-base text-slate-800 dark:text-white">Filter & Pencarian</h2>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
        {/* Search */}
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
            Cari Museum
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Ketik nama museum..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </form>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* Province Filter */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Globe size={13} className="text-blue-500" />
            Provinsi
          </label>
          <div className="relative">
            <select
              value={selectedProvince}
              onChange={(e) => onProvinceChange(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">Semua Provinsi</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.nama_provinsi}>
                  {p.nama_provinsi}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Regency Filter */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Building2 size={13} className="text-purple-500" />
            Kabupaten / Kota
          </label>
          <div className="relative">
            <select
              value={selectedRegency}
              onChange={(e) => onRegencyChange(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">Semua Kabupaten/Kota</option>
              {regencies.map((r) => (
                <option key={r.id} value={r.nama_kabupaten}>
                  {r.nama_kabupaten}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Tag size={13} className="text-amber-500" />
            Kategori
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nama_kategori}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* Nearby Section */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            <Navigation size={13} className="text-emerald-500" />
            Museum Terdekat
          </label>

          {/* Radius Input */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Radius pencarian</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{radiusInput} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={radiusInput}
              onChange={(e) => handleRadiusChange(e.target.value)}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5 km</span>
              <span>200 km</span>
            </div>
          </div>

          {!nearbyMode ? (
            <button
              onClick={onNearby}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Locate size={16} />
              Gunakan Lokasi Saya
            </button>
          ) : (
            <button
              onClick={onResetNearby}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <X size={16} />
              Nonaktifkan Nearby
            </button>
          )}
        </div>

        {/* Category Legend */}
        <div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 mb-4" />
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
            Legenda Kategori
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2 px-2 py-1">
                <div
                  className="w-3 h-3 rounded-full shrink-0 border-2"
                  style={{ backgroundColor: color.bg, borderColor: color.border }}
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-2 py-1">
              <div
                className="w-3 h-3 rounded-full shrink-0 border-2"
                style={{ backgroundColor: DEFAULT_COLOR.bg, borderColor: DEFAULT_COLOR.border }}
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">Lainnya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalResults}</span> museum
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
