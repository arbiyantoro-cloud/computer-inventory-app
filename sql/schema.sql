-- ==========================================
-- COMPUTER INVENTORY SYSTEM - SQL SCHEMA
-- Supabase PostgreSQL Database
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE (Authentication)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'teknisi' CHECK (role IN ('admin', 'teknisi')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  nama_lengkap VARCHAR(255),
  no_telepon VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- 2. MASTER BARANG TABLE (Products)
-- ==========================================
CREATE TABLE IF NOT EXISTS master_barang (
  id SERIAL PRIMARY KEY,
  nama_barang VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  spesifikasi TEXT,
  harga BIGINT NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_master_barang_kategori ON master_barang(kategori);
CREATE INDEX idx_master_barang_nama ON master_barang(nama_barang);

-- ==========================================
-- 3. INVENTARIS KOMPUTER TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS inventaris_komputer (
  id SERIAL PRIMARY KEY,
  nomor_seri VARCHAR(100) UNIQUE NOT NULL,
  barang_id INTEGER NOT NULL REFERENCES master_barang(id) ON DELETE RESTRICT,
  lokasi VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'maintenance', 'rusak', 'retire')),
  tanggal_perolehan DATE,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventaris_nomor_seri ON inventaris_komputer(nomor_seri);
CREATE INDEX idx_inventaris_status ON inventaris_komputer(status);
CREATE INDEX idx_inventaris_barang_id ON inventaris_komputer(barang_id);

-- ==========================================
-- 4. JADWAL MAINTENANCE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS jadwal_maintenance (
  id SERIAL PRIMARY KEY,
  inventaris_id INTEGER NOT NULL REFERENCES inventaris_komputer(id) ON DELETE CASCADE,
  tanggal_jadwal DATE NOT NULL,
  jenis_maintenance VARCHAR(100) NOT NULL CHECK (jenis_maintenance IN (
    'pembersihan',
    'update_software',
    'penggantian_komponen',
    'cek_keamanan',
    'backup_data',
    'lainnya'
  )),
  deskripsi TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'terjadwal' CHECK (status IN ('terjadwal', 'sedang_dilakukan', 'selesai', 'dibatalkan')),
  teknisi VARCHAR(255),
  tanggal_mulai TIMESTAMP WITH TIME ZONE,
  tanggal_selesai TIMESTAMP WITH TIME ZONE,
  catatan_hasil TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jadwal_inventaris_id ON jadwal_maintenance(inventaris_id);
CREATE INDEX idx_jadwal_status ON jadwal_maintenance(status);
CREATE INDEX idx_jadwal_tanggal ON jadwal_maintenance(tanggal_jadwal);

-- ==========================================
-- 5. HISTORY MAINTENANCE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS history_maintenance (
  id SERIAL PRIMARY KEY,
  inventaris_id INTEGER NOT NULL REFERENCES inventaris_komputer(id) ON DELETE CASCADE,
  jadwal_maintenance_id INTEGER REFERENCES jadwal_maintenance(id) ON DELETE SET NULL,
  jenis_maintenance VARCHAR(100) NOT NULL,
  tanggal_mulai TIMESTAMP WITH TIME ZONE NOT NULL,
  tanggal_selesai TIMESTAMP WITH TIME ZONE,
  teknisi VARCHAR(255),
  deskripsi TEXT,
  hasil_maintenance TEXT,
  komponen_diganti TEXT,
  biaya BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_history_inventaris_id ON history_maintenance(inventaris_id);
CREATE INDEX idx_history_tanggal ON history_maintenance(tanggal_mulai);

-- ==========================================
-- 6. TARGET PERAWATAN BULANAN TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS target_perawatan (
  id SERIAL PRIMARY KEY,
  bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
  tahun INTEGER NOT NULL,
  target_unit INTEGER NOT NULL DEFAULT 0,
  tercapai INTEGER NOT NULL DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bulan, tahun)
);

CREATE INDEX idx_target_bulan_tahun ON target_perawatan(tahun, bulan);

-- ==========================================
-- 7. MONITORING DASHBOARD TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS monitoring_dashboard (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL UNIQUE,
  total_komputer INTEGER DEFAULT 0,
  total_aktif INTEGER DEFAULT 0,
  total_maintenance INTEGER DEFAULT 0,
  total_rusak INTEGER DEFAULT 0,
  total_maintenance_hari INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_monitoring_tanggal ON monitoring_dashboard(tanggal);

-- ==========================================
-- TRIGGER: Update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_barang_updated_at BEFORE UPDATE ON master_barang
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventaris_komputer_updated_at BEFORE UPDATE ON inventaris_komputer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jadwal_maintenance_updated_at BEFORE UPDATE ON jadwal_maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_perawatan_updated_at BEFORE UPDATE ON target_perawatan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SAMPLE DATA (Optional)
-- ==========================================

-- Sample Master Barang
INSERT INTO master_barang (nama_barang, kategori, spesifikasi, harga, supplier) VALUES
('Monitor Dell 24"', 'Monitor', 'FHD, IPS, 60Hz', 2500000, 'PT Ventura Indonesia'),
('CPU Intel i5-12400', 'Processor', 'Intel Core i5 Gen 12, 6 Cores', 1800000, 'PT Ventura Indonesia'),
('RAM DDR4 8GB', 'Memory', 'Corsair, 3200MHz', 400000, 'PT Ventura Indonesia'),
('SSD 256GB', 'Storage', 'Kingston A2000', 600000, 'PT Ventura Indonesia'),
('Keyboard Mechanical', 'Input', 'RGB, Mechanical Switches', 500000, 'PT Ventura Indonesia'),
('Mouse Gaming', 'Input', 'Wireless, 16000 DPI', 300000, 'PT Ventura Indonesia')
ON CONFLICT DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- ==========================================
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventaris_komputer ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_perawatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_dashboard ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view all data"
  ON master_barang FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'teknisi');

-- ==========================================
-- END OF SCHEMA
-- ==========================================
