-- Perluas kolom detail museum yang dapat berisi teks panjang dari hasil riset sumber resmi.

ALTER TABLE museum
  ALTER COLUMN jam_buka TYPE TEXT,
  ALTER COLUMN harga_tiket TYPE TEXT,
  ALTER COLUMN website TYPE TEXT,
  ALTER COLUMN sumber_informasi TYPE TEXT;
