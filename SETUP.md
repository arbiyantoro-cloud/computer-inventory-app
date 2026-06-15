# Setup Guide - Computer Inventory System

## Quick Start (5 Menit)

### 1. Persiapan
```bash
git clone <repo-url>
cd computer-inventory-app
npm install
```

### 2. Supabase Setup

#### a. Buat Project
1. Buka https://supabase.com → Login/Sign Up
2. New Project:
   - Project Name: `computer-inventory`
   - Database Password: (simpan dengan aman)
   - Region: pilih terdekat (Jakarta/Singapore)
3. Tunggu selesai (~5-10 menit)

#### b. Setup Database
1. Dashboard → SQL Editor
2. New Query → Copy-paste dari `sql/schema.sql`
3. Run Query
4. Tunggu selesai (lihat tanda ✓)

#### c. Get Credentials
1. Settings → API → Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon Public Key → `VITE_SUPABASE_ANON_KEY`

### 3. Environment Setup
```bash
cp .env.local.example .env.local

# Edit .env.local:
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

### 4. Run Application
```bash
npm run dev

# Buka di browser:
# http://localhost:3000
```

---

## Create Demo Users

### Method 1: Via UI (Recommended)
1. Buka http://localhost:3000/login
2. Klik "Daftar"
3. Isi email & password
4. Setelah berhasil register, update role via database

### Method 2: Direct Database

#### Admin User
```sql
-- Dulu auth user dulu di Supabase:
-- Auth → Users → + Add user → isi email & password → copy user ID

INSERT INTO users (id, email, role, status, nama_lengkap) VALUES
('UUID_FROM_AUTH', 'admin@test.com', 'admin', 'active', 'Administrator'),
('UUID_FROM_AUTH2', 'teknisi@test.com', 'teknisi', 'active', 'Teknisi 1');
```

#### Via SQL Editor
1. Dashboard → SQL Editor → New Query
2. Paste SQL di atas
3. Update UUID sesuai user yang sudah dibuat di Auth
4. Run

---

## Insert Sample Data

```sql
-- Master Barang
INSERT INTO master_barang (nama_barang, kategori, spesifikasi, harga, supplier) VALUES
('Monitor Dell U2720Q', 'Monitor', '4K, 60Hz, USB-C', 4500000, 'PT Ventura'),
('Laptop ASUS Vivobook', 'Laptop', 'Intel i5, 8GB RAM, 512GB SSD', 8000000, 'PT Ventura'),
('Keyboard Mechanical RGB', 'Peripheral', 'Mechanical Switch, RGB', 500000, 'PT Ventura'),
('Mouse Logitech MX Master', 'Peripheral', 'Wireless, 4K Flow', 900000, 'PT Ventura'),
('UPS APC 2KVA', 'Power', 'Backup Power', 5000000, 'PT Ventura');

-- Inventaris Komputer
INSERT INTO inventaris_komputer (nomor_seri, barang_id, lokasi, status, tanggal_perolehan) VALUES
('DL-001-2024', 1, 'Ruang 101 - Meja 1', 'aktif', '2024-01-15'),
('AS-002-2024', 2, 'Ruang 102 - Meja 2', 'aktif', '2024-02-10'),
('KB-003-2024', 3, 'Ruang 101 - Meja 1', 'aktif', '2024-01-20'),
('MS-004-2024', 4, 'Ruang 102 - Meja 2', 'maintenance', '2024-03-05'),
('UPS-005-2024', 5, 'Ruang Server', 'aktif', '2024-01-01');

-- Jadwal Maintenance
INSERT INTO jadwal_maintenance (inventaris_id, tanggal_jadwal, jenis_maintenance, teknisi, status) VALUES
(1, '2026-06-20', 'pembersihan', 'Budi Santoso', 'terjadwal'),
(2, '2026-06-25', 'update_software', 'Ani Wijaya', 'terjadwal'),
(4, '2026-06-18', 'penggantian_komponen', 'Budi Santoso', 'sedang_dilakukan');

-- Target Perawatan
INSERT INTO target_perawatan (bulan, tahun, target_unit, tercapai) VALUES
(6, 2026, 15, 8),
(5, 2026, 12, 12),
(4, 2026, 10, 7);
```

Copy-paste ke SQL Editor → Run

---

## Verify Installation

### ✓ Checklist

- [ ] `.env.local` sudah dibuat dengan credentials Supabase
- [ ] Database schema sudah di-create di Supabase
- [ ] Admin user sudah dibuat
- [ ] Sample data sudah diinsert
- [ ] `npm run dev` berjalan tanpa error
- [ ] Bisa login dengan admin account
- [ ] Bisa lihat dashboard dengan statistik
- [ ] Bisa CRUD Master Barang
- [ ] Bisa CRUD Inventaris
- [ ] Bisa CRUD Jadwal Maintenance

### Test Login
```
Email: admin@test.com
Password: (sesuai yang didaftar)
Role: Admin
```

---

## Production Deployment

### Build
```bash
npm run build
```

Hasilnya di folder `dist/`

### Deploy Options

#### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### 2. Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

#### 3. GitHub Pages
```bash
git push
# Actions akan auto build & deploy
```

---

## Next Steps

1. **Customize**: Sesuaikan branding, warna, teksti
2. **Add Features**: History maintenance, reporting, exports
3. **Mobile Responsive**: Cek di berbagai ukuran layar
4. **Testing**: Unit test, integration test
5. **Monitoring**: Setup error tracking (Sentry)
6. **Backup**: Configure automatic backups

---

## Support

- 📖 [Dokumentasi Lengkap](./README.md)
- 💬 GitHub Issues
- 📧 Contact: arbiyantoro@gmail.com

---

**Ready to go!** 🚀
