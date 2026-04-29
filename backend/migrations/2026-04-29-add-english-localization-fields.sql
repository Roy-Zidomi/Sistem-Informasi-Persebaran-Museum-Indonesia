-- English localization fields for the public bilingual experience.
-- Idempotent so it is safe to run with the existing simple migration runner.

ALTER TABLE museum
  ADD COLUMN IF NOT EXISTS deskripsi_en TEXT,
  ADD COLUMN IF NOT EXISTS jam_buka_en TEXT,
  ADD COLUMN IF NOT EXISTS alamat_lengkap_en TEXT;

ALTER TABLE kategori
  ADD COLUMN IF NOT EXISTS nama_kategori_en VARCHAR(255);

ALTER TABLE provinsi
  ADD COLUMN IF NOT EXISTS nama_provinsi_en VARCHAR(255);

ALTER TABLE kabupaten
  ADD COLUMN IF NOT EXISTS nama_kabupaten_en VARCHAR(255);

UPDATE kategori
SET nama_kategori_en = CASE nama_kategori
  WHEN 'Alam' THEN 'Nature'
  WHEN 'Khusus' THEN 'Special Interest'
  WHEN 'Militer' THEN 'Military'
  WHEN 'Sains & Teknologi' THEN 'Science & Technology'
  WHEN 'Sejarah' THEN 'History'
  WHEN 'Seni & Budaya' THEN 'Art & Culture'
  ELSE nama_kategori
END
WHERE nama_kategori_en IS NULL OR nama_kategori_en = '';

UPDATE provinsi
SET nama_provinsi_en = CASE nama_provinsi
  WHEN 'Aceh' THEN 'Aceh'
  WHEN 'Bali' THEN 'Bali'
  WHEN 'Banten' THEN 'Banten'
  WHEN 'Bengkulu' THEN 'Bengkulu'
  WHEN 'DI Yogyakarta' THEN 'Special Region of Yogyakarta'
  WHEN 'DKI Jakarta' THEN 'Special Capital Region of Jakarta'
  WHEN 'Gorontalo' THEN 'Gorontalo'
  WHEN 'Jambi' THEN 'Jambi'
  WHEN 'Jawa Barat' THEN 'West Java'
  WHEN 'Jawa Tengah' THEN 'Central Java'
  WHEN 'Jawa Timur' THEN 'East Java'
  WHEN 'Kalimantan Barat' THEN 'West Kalimantan'
  WHEN 'Kalimantan Selatan' THEN 'South Kalimantan'
  WHEN 'Kalimantan Tengah' THEN 'Central Kalimantan'
  WHEN 'Kalimantan Timur' THEN 'East Kalimantan'
  WHEN 'Kalimantan Utara' THEN 'North Kalimantan'
  WHEN 'Kepulauan Bangka Belitung' THEN 'Bangka Belitung Islands'
  WHEN 'Kepulauan Riau' THEN 'Riau Islands'
  WHEN 'Lampung' THEN 'Lampung'
  WHEN 'Maluku' THEN 'Maluku'
  WHEN 'Maluku Utara' THEN 'North Maluku'
  WHEN 'Nusa Tenggara Barat' THEN 'West Nusa Tenggara'
  WHEN 'Nusa Tenggara Timur' THEN 'East Nusa Tenggara'
  WHEN 'Papua' THEN 'Papua'
  WHEN 'Papua Barat' THEN 'West Papua'
  WHEN 'Riau' THEN 'Riau'
  WHEN 'Sulawesi Barat' THEN 'West Sulawesi'
  WHEN 'Sulawesi Selatan' THEN 'South Sulawesi'
  WHEN 'Sulawesi Tengah' THEN 'Central Sulawesi'
  WHEN 'Sulawesi Tenggara' THEN 'Southeast Sulawesi'
  WHEN 'Sulawesi Utara' THEN 'North Sulawesi'
  WHEN 'Sumatera Barat' THEN 'West Sumatra'
  WHEN 'Sumatera Selatan' THEN 'South Sumatra'
  WHEN 'Sumatera Utara' THEN 'North Sumatra'
  ELSE nama_provinsi
END
WHERE nama_provinsi_en IS NULL OR nama_provinsi_en = '';

UPDATE kabupaten
SET nama_kabupaten_en = regexp_replace(
  regexp_replace(nama_kabupaten, '^Kota ', ''),
  '^Kabupaten ',
  ''
) || CASE
  WHEN nama_kabupaten ILIKE 'Kota %' THEN ' City'
  WHEN nama_kabupaten ILIKE 'Kabupaten %' THEN ' Regency'
  ELSE ''
END
WHERE nama_kabupaten_en IS NULL OR nama_kabupaten_en = '';

-- Museum text translations should be curated. Keep them NULL until a real English
-- translation is provided; the frontend falls back to Indonesian when needed.
