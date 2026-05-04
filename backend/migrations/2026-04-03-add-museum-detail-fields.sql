-- Tambahkan kolom detail museum untuk halaman detail
-- Jalankan sekali pada database PostgreSQL yang dipakai aplikasi.

ALTER TABLE museum
  ADD COLUMN IF NOT EXISTS deskripsi TEXT,
  ADD COLUMN IF NOT EXISTS tahun_dibangun INTEGER,
  ADD COLUMN IF NOT EXISTS alamat_lengkap TEXT,
  ADD COLUMN IF NOT EXISTS jam_buka VARCHAR(120),
  ADD COLUMN IF NOT EXISTS harga_tiket VARCHAR(120),
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sumber_informasi VARCHAR(255),
  ADD COLUMN IF NOT EXISTS foto_url TEXT;
