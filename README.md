# Computer Inventory System - Dokumentasi Lengkap

## 📋 Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Fitur Utama](#fitur-utama)
3. [Instalasi](#instalasi)
4. [Konfigurasi Supabase](#konfigurasi-supabase)
5. [Struktur Folder](#struktur-folder)
6. [Penggunaan](#penggunaan)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Role & Permissions](#role--permissions)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Pengenalan

**Computer Inventory System** adalah aplikasi web modern untuk manajemen inventaris komputer dan jadwal perawatan. Dibangun dengan **React** dan **Supabase**, aplikasi ini menyediakan dashboard monitoring, manajemen master barang, tracking inventaris, dan perencanaan maintenance.

### Tech Stack
- **Frontend**: React 18.2 + React Router v6
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Auth**: Supabase Auth

---

## ✨ Fitur Utama

### 1. **Authentication & Authorization**
- Login/Register dengan email & password
- Role-based Access Control (RBAC)
- 2 Role: Admin dan Teknisi

### 2. **Master Barang** (Admin Only)
- CRUD master barang/komponen komputer
- Kategori: CPU, RAM, Monitor, Storage, dll
- Tracking harga dan supplier

### 3. **Inventaris Komputer** (Admin & Teknisi)
- Registrasi komputer dengan nomor seri unique
- Status tracking: Aktif, Maintenance, Rusak, Retire
- Lokasi dan tanggal perolehan
- View-only untuk Teknisi

### 4. **Jadwal Maintenance** (Admin & Teknisi)
- Penjadwalan maintenance rutin
- Jenis: Pembersihan, Update, Penggantian, Cek Keamanan, Backup
- Tracking status: Terjadwal, Sedang Dilakukan, Selesai
- Assigned to Teknisi

### 5. **History Maintenance** (Admin & Teknisi)
- Catatan lengkap maintenance yang telah dilakukan
- Komponen yang diganti
- Waktu dan teknisi yang bertanggung jawab

### 6. **Dashboard Monitoring** (Admin & Teknisi)
- Statistik real-time: Total komputer, Status distribution
- Grafik pie chart status komputer
- Bar chart statistik bulanan
- Quick stats cards

### 7. **Target Perawatan Bulanan** (Admin Only)
- Set target maintenance per bulan
- Track realisasi vs target
- Grafik perbandingan target & realisasi
- Analisis persentase pencapaian

---

## 🚀 Instalasi

### Prerequisites
- Node.js v16+ dan npm/yarn
- Git
- Akun Supabase (free tier cukup)

### Step 1: Clone Repository
```bash
git clone https://github.com/arbiyantoro-cloud/computer-inventory-app.git
cd computer-inventory-app
```

### Step 2: Install Dependencies
```bash
npm install
# atau
yarn install
```

### Step 3: Setup Supabase

#### 3a. Buat Supabase Project
1. Buka https://supabase.com
2. Sign up atau login
3. Klik "New Project"
4. Isi project name, database password, region
5. Tunggu project selesai di-setup (5-10 menit)

#### 3b. Create Database Tables
1. Buka **SQL Editor** di Supabase dashboard
2. Buat query baru
3. Copy-paste isi dari file `sql/schema.sql`
4. Jalankan query (klik tombol "Run")
5. Tunggu hingga selesai tanpa error

#### 3c. Enable Auth
1. Buka **Authentication** → **Providers**
2. Pastikan "Email" sudah enabled
3. Buka **Settings** → **Email** → Update email template jika perlu

#### 3d. Get Credentials
1. Buka **Settings** → **API**
2. Copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### Step 4: Configure Environment
```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local dan isi:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Run Development Server
```bash
npm run dev
```

Aplikasi akan buka di `http://localhost:3000`

---

## 🔐 Konfigurasi Supabase

### User Management

#### Membuat User Admin via SQL
```sql
INSERT INTO users (id, email, role, status) VALUES
('USER_ID_FROM_AUTH', 'admin@example.com', 'admin', 'active');
```

#### Membuat User Teknisi via SQL
```sql
INSERT INTO users (id, email, role, status) VALUES
('USER_ID_FROM_AUTH', 'teknisi@example.com', 'teknisi', 'active');
```

### Enable RLS (Row Level Security)
RLS sudah enabled di schema.sql dengan policies basic. Untuk production:

1. Buka **Authentication** → **Policies**
2. Review dan update policies sesuai kebutuhan
3. Test policies dengan role yang berbeda

### Backup Database
```bash
# Via Supabase Dashboard:
# 1. Settings → Backups
# 2. Download backup otomatis atau manual
```

---

## 📁 Struktur Folder

```
computer-inventory-app/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client config
│   ├── components/
│   │   ├── Auth/
│   │   │   └── PrivateRoute.jsx
│   │   ├── Shared/
│   │   │   ├── Header.jsx       # Navigation header
│   │   │   ├── Sidebar.jsx      # Side navigation
│   │   │   ├── Loading.jsx      # Loading spinner
│   │   │   ├── Modal.jsx        # Reusable modal dialog
│   │   │   └── Table.jsx        # Reusable data table
│   │   └── Admin/               # Admin-specific components
│   ├── pages/
│   │   ├── Login.jsx            # Login & Register page
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── AdminPanel.jsx       # Admin layout
│   │   ├── TechnisianPanel.jsx  # Technician layout
│   │   ├── Admin/
│   │   │   ├── MasterBarang.jsx     # Master items management
│   │   │   ├── Inventaris.jsx       # Inventory management
│   │   │   ├── Maintenance.jsx      # Maintenance scheduling
│   │   │   └── TargetPerawatan.jsx  # Maintenance targets
│   │   └── Technician/          # Technician pages (todo)
│   ├── services/                # API services (future)
│   ├── hooks/                   # Custom React hooks (future)
│   ├── utils/                   # Utility functions (future)
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/
│   └── vite.svg                 # Public assets
├── sql/
│   └── schema.sql               # Database schema
├── .env.local.example           # Environment example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js
├── vite.config.js               # Vite configuration
└── README.md
```

---

## 📖 Penggunaan

### Login
1. Buka aplikasi di `http://localhost:3000`
2. Masuk dengan email dan password
3. Jika belum ada akun, klik "Daftar" untuk registrasi baru

### Admin Features

#### Master Barang
- **Tambah**: Klik tombol "Tambah Barang", isi form, simpan
- **Edit**: Klik tombol "Edit" pada baris, update data, simpan
- **Hapus**: Klik tombol "Hapus" dengan konfirmasi

#### Inventaris Komputer
- **Tambah**: Input nomor seri, pilih barang, lokasi, status
- **View**: Lihat semua inventaris dengan filter status
- **Edit**: Update status, lokasi, atau keterangan

#### Jadwal Maintenance
- **Buat Jadwal**: Pilih komputer, tanggal, jenis maintenance
- **Track Status**: Monitor progres maintenance
- **Assign Teknisi**: Tetapkan teknisi yang bertanggung jawab

#### Target Perawatan
- **Set Target**: Tentukan target maintenance per bulan
- **Update Realisasi**: Update unit yang sudah dikerjakan
- **Analisis**: Lihat grafik vs realisasi

### Technician Features
- **View Inventaris**: Lihat daftar komputer (read-only)
- **View Jadwal**: Lihat maintenance yang ditugaskan
- **Update Status**: Update status maintenance saat bekerja
- **View Dashboard**: Monitor statistik inventory

---

## 🔗 API Endpoints (via Supabase)

### Authentication
```javascript
// Login
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Register
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Logout
await supabase.auth.signOut()
```

### Master Barang
```javascript
// Get all
const { data } = await supabase.from('master_barang').select('*')

// Create
await supabase.from('master_barang').insert([{ nama_barang: '...', ... }])

// Update
await supabase.from('master_barang').update({ ... }).eq('id', 1)

// Delete
await supabase.from('master_barang').delete().eq('id', 1)
```

### Inventaris Komputer
```javascript
// Get with relationships
const { data } = await supabase
  .from('inventaris_komputer')
  .select('*, master_barang(nama_barang)')

// Filter by status
const { data } = await supabase
  .from('inventaris_komputer')
  .select('*')
  .eq('status', 'aktif')
```

### Jadwal Maintenance
```javascript
// Get scheduled for date range
const { data } = await supabase
  .from('jadwal_maintenance')
  .select('*, inventaris_komputer(nomor_seri, master_barang(nama_barang))')
  .gte('tanggal_jadwal', startDate)
  .lte('tanggal_jadwal', endDate)
```

---

## 🗄️ Database Schema

### Tables Overview

| Tabel | Deskripsi | Primary Key |
|-------|-----------|-------------|
| `users` | User accounts | UUID (from auth) |
| `master_barang` | Item catalog | INT |
| `inventaris_komputer` | Computer inventory | INT |
| `jadwal_maintenance` | Maintenance schedule | INT |
| `history_maintenance` | Maintenance history | INT |
| `target_perawatan` | Monthly targets | INT |
| `monitoring_dashboard` | Monitoring snapshot | INT |

### Relationships
```
users (1) ──────── (N) jadwal_maintenance : teknisi
  │
  └─ role: admin / teknisi

master_barang (1) ──────── (N) inventaris_komputer
inventaris_komputer (1) ──────── (N) jadwal_maintenance
inventaris_komputer (1) ──────── (N) history_maintenance
```

---

## 👥 Role & Permissions

### Admin
✅ CRUD Master Barang
✅ CRUD Inventaris Komputer
✅ CRUD Jadwal Maintenance
✅ View History Maintenance
✅ CRUD Target Perawatan
✅ Full Dashboard Access
✅ View & Export Reports

### Teknisi
✅ View Inventaris Komputer (read-only)
✅ View Jadwal Maintenance
✅ Update Jadwal Status
✅ Add Maintenance Notes
✅ View Dashboard (limited)
❌ Modify Master Barang
❌ Create Targets
❌ Delete Records

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution**: 
- Pastikan `.env.local` sudah dibuat dengan nilai yang benar
- Restart dev server setelah update `.env.local`

### Error: "Database connection failed"
**Solution**:
- Cek internet connection
- Verifikasi Supabase URL dan key di `.env.local`
- Pastikan project Supabase sudah aktif

### Error: "No rows returned"
**Solution**:
- Pastikan data sudah diinsert ke database
- Check RLS policies apakah mengizinkan akses
- Verifikasi user role di `users` table

### Komponen tidak muncul
**Solution**:
- Check console untuk error message
- Pastikan semua import path benar
- Verify Tailwind CSS compiled dengan jalankan `npm run dev`

### Password reset
**Solution**:
1. Di Supabase dashboard, buka **Authentication** → **Users**
2. Cari user, klik tiga titik, pilih "Reset password"
3. User akan menerima email reset

---

## 📞 Support

### Dokumentasi Resmi
- [React](https://react.dev)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev)

### Common Issues
Lihat bagian **Troubleshooting** di atas atau buka GitHub issues.

---

## 📜 License

Proyek ini open source. Silakan gunakan dan modifikasi sesuai kebutuhan.

---

**Last Updated**: June 2026
**Version**: 1.0.0
