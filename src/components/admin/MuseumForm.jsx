import React, { useState, useEffect } from 'react';
import { getProvinces, getRegencies, getCategories } from '../../api/museumApi';
import { ChevronDown, Save, X, Loader2 } from 'lucide-react';

const MuseumForm = ({ museum = null, onSubmit, onCancel, loading = false }) => {
  const isEdit = !!museum;

  const [formData, setFormData] = useState({
    nama_museum: '',
    latitude: '',
    longitude: '',
    provinsi_id: '',
    kabupaten_id: '',
    kategori_id: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Prefill form when editing
  useEffect(() => {
    if (museum) {
      setFormData({
        nama_museum: museum.nama_museum || '',
        latitude: museum.latitude || '',
        longitude: museum.longitude || '',
        provinsi_id: museum.provinsi_id || '',
        kabupaten_id: museum.kabupaten_id || '',
        kategori_id: museum.kategori_id || '',
      });
    } else {
      setFormData({ nama_museum: '', latitude: '', longitude: '', provinsi_id: '', kabupaten_id: '', kategori_id: '' });
    }
  }, [museum]);

  // Load provinces and categories
  useEffect(() => {
    const load = async () => {
      try {
        const [provRes, catRes] = await Promise.all([getProvinces(), getCategories()]);
        setProvinces(provRes.data || []);
        setCategories(catRes.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Load regencies when province changes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRegencies(formData.provinsi_id || null);
        setRegencies(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [formData.provinsi_id]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'provinsi_id') updated.kabupaten_id = '';
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSuccess('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nama_museum.trim()) newErrors.nama_museum = 'Nama museum wajib diisi';
    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) newErrors.latitude = 'Latitude wajib berupa angka';
    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) newErrors.longitude = 'Longitude wajib berupa angka';
    if (!formData.provinsi_id) newErrors.provinsi_id = 'Provinsi wajib dipilih';
    if (!formData.kabupaten_id) newErrors.kabupaten_id = 'Kabupaten wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        provinsi_id: parseInt(formData.provinsi_id),
        kabupaten_id: parseInt(formData.kabupaten_id),
        kategori_id: formData.kategori_id ? parseInt(formData.kategori_id) : null,
      });
      setSuccess(isEdit ? 'Museum berhasil diperbarui!' : 'Museum berhasil ditambahkan!');
      if (!isEdit) {
        setFormData({ nama_museum: '', latitude: '', longitude: '', provinsi_id: '', kabupaten_id: '', kategori_id: '' });
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Terjadi kesalahan' });
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border ${
      errors[field] ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
    } text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          {isEdit ? 'Edit Museum' : 'Tambah Museum Baru'}
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
          {success}
        </div>
      )}
      {errors.submit && (
        <div className="p-3 mb-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Museum */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nama Museum *</label>
          <input
            type="text"
            value={formData.nama_museum}
            onChange={(e) => handleChange('nama_museum', e.target.value)}
            placeholder="Masukkan nama museum"
            className={inputClass('nama_museum')}
          />
          {errors.nama_museum && <p className="text-xs text-red-500 mt-1">{errors.nama_museum}</p>}
        </div>

        {/* Provinsi & Kabupaten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Provinsi *</label>
            <div className="relative">
              <select value={formData.provinsi_id} onChange={(e) => handleChange('provinsi_id', e.target.value)} className={`${inputClass('provinsi_id')} appearance-none pr-10 cursor-pointer`}>
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.nama_provinsi}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.provinsi_id && <p className="text-xs text-red-500 mt-1">{errors.provinsi_id}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kabupaten/Kota *</label>
            <div className="relative">
              <select value={formData.kabupaten_id} onChange={(e) => handleChange('kabupaten_id', e.target.value)} className={`${inputClass('kabupaten_id')} appearance-none pr-10 cursor-pointer`}>
                <option value="">Pilih Kabupaten</option>
                {regencies.map((r) => <option key={r.id} value={r.id}>{r.nama_kabupaten}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.kabupaten_id && <p className="text-xs text-red-500 mt-1">{errors.kabupaten_id}</p>}
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kategori (opsional)</label>
          <div className="relative">
            <select value={formData.kategori_id} onChange={(e) => handleChange('kategori_id', e.target.value)} className={`${inputClass('kategori_id')} appearance-none pr-10 cursor-pointer`}>
              <option value="">Tidak dikategorikan</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nama_kategori}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Latitude *</label>
            <input type="number" step="any" value={formData.latitude} onChange={(e) => handleChange('latitude', e.target.value)} placeholder="-6.175" className={inputClass('latitude')} />
            {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Longitude *</label>
            <input type="number" step="any" value={formData.longitude} onChange={(e) => handleChange('longitude', e.target.value)} placeholder="106.827" className={inputClass('longitude')} />
            {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Museum'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MuseumForm;
