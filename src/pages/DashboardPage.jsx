import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProvinces, getRegencies, getCategories } from '../api/museumApi';
import {
  getDashboardStats, getMuseumsByProvince, getMuseumsByCategory,
  getTopRegencies, getAdminMuseums, createMuseum, updateMuseum, deleteMuseum,
} from '../api/adminApi';
import SidebarMenu from '../components/admin/SidebarMenu';
import StatCards from '../components/admin/StatCards';
import ChartProvince from '../components/admin/ChartProvince';
import ChartCategory from '../components/admin/ChartCategory';
import ChartTopRegency from '../components/admin/ChartTopRegency';
import MuseumTable from '../components/admin/MuseumTable';
import MuseumForm from '../components/admin/MuseumForm';
import { Menu } from 'lucide-react';

const DashboardPage = () => {
  const { admin } = useAuth();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Master data
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [categories, setCategories] = useState([]);

  // Global filters
  const [filters, setFilters] = useState({
    provinsi_id: '', kabupaten_id: '', kategori_id: '',
  });

  // Dashboard data
  const [stats, setStats] = useState({});
  const [chartProvince, setChartProvince] = useState([]);
  const [chartCategory, setChartCategory] = useState([]);
  const [chartRegency, setChartRegency] = useState([]);

  // Museum table data
  const [museums, setMuseums] = useState([]);
  const [pagination, setPagination] = useState({});
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);

  // Edit mode
  const [editMuseum, setEditMuseum] = useState(null);

  // Load master data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [provRes, catRes] = await Promise.all([getProvinces(), getCategories()]);
        setProvinces(provRes.data || []);
        setCategories(catRes.data || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  // Jika kembali ke layar desktop, pastikan sidebar kembali ke mode desktop normal
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load regencies when province changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRegencies(filters.provinsi_id || null);
        setRegencies(res.data || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, [filters.provinsi_id]);

  // Build clean filters (remove empty)
  const cleanFilters = useCallback(() => {
    const clean = {};
    if (filters.provinsi_id) clean.provinsi_id = filters.provinsi_id;
    if (filters.kabupaten_id) clean.kabupaten_id = filters.kabupaten_id;
    if (filters.kategori_id) clean.kategori_id = filters.kategori_id;
    return clean;
  }, [filters]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const f = cleanFilters();
      const [statsRes, provRes, catRes, regRes] = await Promise.all([
        getDashboardStats(f),
        getMuseumsByProvince(f),
        getMuseumsByCategory(f),
        getTopRegencies(f),
      ]);
      setStats(statsRes.data || {});
      setChartProvince(provRes.data || []);
      setChartCategory(catRes.data || []);
      setChartRegency(regRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [cleanFilters]);

  // Fetch museum table
  const fetchMuseums = useCallback(async () => {
    setLoading(true);
    try {
      const f = cleanFilters();
      const res = await getAdminMuseums({ ...f, page: tablePage, limit: 10, search: tableSearch });
      setMuseums(res.data || []);
      setPagination(res.pagination || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [cleanFilters, tablePage, tableSearch]);

  // Re-fetch when filters or active menu change
  useEffect(() => {
    if (activeMenu === 'dashboard') fetchDashboard();
    else if (activeMenu === 'museums') fetchMuseums();
  }, [activeMenu, filters, fetchDashboard, fetchMuseums]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'provinsi_id') updated.kabupaten_id = '';
      return updated;
    });
    setTablePage(1);
  };

  const handleResetFilters = () => {
    setFilters({ provinsi_id: '', kabupaten_id: '', kategori_id: '' });
    setTablePage(1);
  };

  // Museum CRUD handlers
  const handleCreateMuseum = async (data) => {
    setFormLoading(true);
    try {
      await createMuseum(data);
      if (activeMenu === 'dashboard') fetchDashboard();
    } finally { setFormLoading(false); }
  };

  const handleUpdateMuseum = async (data) => {
    setFormLoading(true);
    try {
      await updateMuseum(editMuseum.id, data);
      setEditMuseum(null);
      setActiveMenu('museums');
      fetchMuseums();
    } finally { setFormLoading(false); }
  };

  const handleDeleteMuseum = async (id) => {
    try {
      await deleteMuseum(id);
      fetchMuseums();
    } catch (e) { console.error(e); }
  };

  const handleEditMuseum = (museum) => {
    setEditMuseum(museum);
    setActiveMenu('edit');
  };

  const handleSidebarMenuChange = (menuKey) => {
    setActiveMenu(menuKey);
    setEditMuseum(null);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <StatCards stats={stats} loading={loading} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartProvince data={chartProvince} loading={loading} />
              <ChartCategory data={chartCategory} loading={loading} />
            </div>
            <ChartTopRegency data={chartRegency} loading={loading} />
          </div>
        );
      case 'museums':
        return (
          <MuseumTable
            museums={museums}
            pagination={pagination}
            loading={loading}
            onPageChange={(p) => setTablePage(p)}
            onSearch={(s) => { setTableSearch(s); setTablePage(1); }}
            onEdit={handleEditMuseum}
            onDelete={handleDeleteMuseum}
          />
        );
      case 'add':
        return <MuseumForm onSubmit={handleCreateMuseum} loading={formLoading} />;
      case 'edit':
        return (
          <MuseumForm
            museum={editMuseum}
            onSubmit={handleUpdateMuseum}
            onCancel={() => { setEditMuseum(null); setActiveMenu('museums'); }}
            loading={formLoading}
          />
        );
      default:
        return null;
    }
  };

  const menuTitles = { dashboard: 'Dashboard', museums: 'Kelola Museum', add: 'Tambah Museum', edit: 'Edit Museum' };
  const menuDescriptions = {
    dashboard: 'Ringkasan performa platform museum.',
    museums: 'Kelola, cari, dan perbarui data museum dengan cepat.',
    add: 'Tambahkan data museum baru ke dalam sistem.',
    edit: 'Perbarui informasi museum yang sudah terdaftar.',
  };

  return (
    <div className="h-screen w-screen flex bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 lg:static lg:translate-x-0 lg:shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full w-64">
          <SidebarMenu
            activeMenu={activeMenu === 'edit' ? 'museums' : activeMenu}
            onMenuChange={handleSidebarMenuChange}
            provinces={provinces}
            regencies={regencies}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-[4.5rem] px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle sidebar menu"
            >
              <Menu size={18} />
            </button>
            <span className="text-xs font-semibold tracking-[0.24em] text-slate-500 dark:text-slate-400 uppercase">Admin Panel</span>
          </div>
          <div />
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <section className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent bg-white/80 dark:bg-slate-900 px-6 py-5">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{menuTitles[activeMenu]}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {menuDescriptions[activeMenu]} Selamat datang, {admin?.email || 'Admin'}.
            </p>
          </section>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
