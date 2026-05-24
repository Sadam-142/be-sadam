# BE-SADAM — Backend Sistem Informasi Keanggotaan UKM Risalah

Backend RESTful API untuk **Sistem Informasi Keanggotaan UKM Risalah** berbasis Progressive Web App (PWA).  
Dibangun menggunakan **Express.js + TypeScript + Turso (libsql/SQLite)** dengan arsitektur **Clean Architecture**.

> Skripsi: *Sistem Informasi Keanggotaan UKM Risalah Berbasis Progressive Web App Menggunakan Metode Prototype*

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan Server](#menjalankan-server)
- [Struktur Folder](#struktur-folder)
- [API Endpoints](#api-endpoints)
  - [Auth](#1-auth)
  - [Pendaftaran](#2-pendaftaran)
  - [Anggota](#3-anggota--verifikasi)
  - [Kegiatan](#4-kegiatan)
  - [Presensi](#5-presensi)
  - [Laporan](#6-laporan)
  - [Sync (PWA Offline-First)](#7-sync-pwa-offline-first)
  - [Notifikasi](#8-notifikasi)
  - [Device Token](#9-device-token-pwa-push)
- [Database Schema](#database-schema)
- [Fitur Utama](#fitur-utama)
- [Default Admin](#default-admin)

---

## Tech Stack

| Teknologi | Keterangan |
|---|---|
| **Runtime** | [Bun](https://bun.sh) v1.2+ |
| **Framework** | Express.js v5 |
| **Bahasa** | TypeScript (strict mode) |
| **Database** | Turso (libsql / SQLite) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Validasi** | Zod v4 |
| **Logging** | Pino + pino-pretty |
| **Upload** | Multer (disk storage) |
| **Security** | CORS, express-rate-limit |

---

## Arsitektur

Menggunakan **Clean Architecture** dengan pattern:

```
Request → Routes → Controllers → Services → Repositories → Database
```

```
src/
├── config/        # Environment & konfigurasi
├── middleware/     # Auth, Role, Error handler, Upload
├── routes/        # Definisi endpoint
├── controllers/   # Request/Response handling
├── services/      # Business logic
├── repositories/  # Database queries
├── validators/    # Zod schema validation
├── types/         # TypeScript interfaces
└── utils/         # Helper functions
```

---

## Instalasi

### Prasyarat

- [Bun](https://bun.sh) v1.2+
- Akun [Turso](https://turso.tech) (untuk database)

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd be-sadam

# 2. Install dependencies
bun install

# 3. Buat file .env (lihat bagian Environment Variables)
cp .env.example .env

# 4. Jalankan server
bun run dev
```

---

## Environment Variables

Buat file `.env` di root project:

```env
PORT=3000
NODE_ENV=development

# Turso Database
TURSO_URL=libsql://your-database.turso.io
TURSO_API_KEY=your-turso-auth-token

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

| Variable | Deskripsi | Default |
|---|---|---|
| `PORT` | Port server | `3000` |
| `NODE_ENV` | Environment (`development` / `production` / `test`) | `development` |
| `TURSO_URL` | URL database Turso | *wajib* |
| `TURSO_API_KEY` | Auth token Turso | *wajib* |
| `JWT_SECRET` | Secret key untuk JWT | `risalah-ukm-secret-key-2026` |
| `JWT_EXPIRES_IN` | Masa berlaku token | `7d` |

---

## Menjalankan Server

```bash
# Development (hot-reload)
bun run dev

# Server akan berjalan di:
# http://localhost:3000
# Health check: http://localhost:3000/health
# API base: http://localhost:3000/api
```

Saat startup, server akan otomatis:
1. Menjalankan database migration (CREATE TABLE IF NOT EXISTS)
2. Seed admin user default (jika belum ada)
3. Memulai sync queue worker (background, interval 30 detik)

---

## Struktur Folder

```
be-sadam/
├── src/
│   ├── index.ts                    # Entry point & bootstrap
│   ├── app.ts                      # Express app setup
│   ├── config/
│   │   └── env.ts                  # Environment config (Zod validated)
│   ├── db/
│   │   ├── index.ts                # Turso client connection
│   │   └── migrate.ts              # Migration runner + admin seeder
│   ├── schemas/
│   │   ├── schema.sql              # Original MySQL schema (referensi)
│   │   └── schema.sqlite.sql       # SQLite-adapted schema (dipakai)
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT token verification
│   │   ├── role.middleware.ts       # Role-based access control
│   │   ├── error.middleware.ts      # Global error handler + asyncHandler
│   │   └── upload.middleware.ts     # Multer file upload config
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── pendaftaran.routes.ts
│   │   ├── anggota.routes.ts
│   │   ├── kegiatan.routes.ts
│   │   ├── presensi.routes.ts
│   │   ├── laporan.routes.ts
│   │   ├── sync.routes.ts
│   │   ├── notifikasi.routes.ts
│   │   └── device.routes.ts
│   ├── controllers/                # 9 controller files
│   ├── services/                   # 9 service files + sync worker
│   ├── repositories/               # 6 repository files
│   ├── validators/                 # 5 Zod validator files
│   ├── types/
│   │   ├── index.ts                # Shared interfaces
│   │   └── express.d.ts            # Express Request augmentation
│   └── utils/
│       ├── response.ts             # sendSuccess / sendError helpers
│       ├── logger.ts               # Pino logger
│       └── generate-no-anggota.ts  # Auto-generate RSL-YYYY-XXXX
├── uploads/                        # File uploads directory
├── .env                            # Environment variables
├── package.json
└── tsconfig.json
```

---

## API Endpoints

**Base URL:** `http://localhost:3000/api`

### Response Format

Semua response menggunakan format konsisten:

```json
{
  "success": true,
  "message": "Deskripsi hasil",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Deskripsi error",
  "errors": []
}
```

---

### 1. Auth

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Tidak | Login user, mendapatkan JWT token |
| `GET` | `/api/auth/me` | Ya | Mendapatkan data user yang sedang login |

#### `POST /api/auth/login`

Request body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id_anggota": 1,
      "username": "admin",
      "role": "admin",
      "no_anggota": "RSL-2026-0000",
      "status_anggota": "aktif"
    }
  }
}
```

---

### 2. Pendaftaran

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/pendaftaran` | Tidak | - | Daftar sebagai calon anggota |
| `GET` | `/api/pendaftaran` | Ya | Admin | Lihat semua pendaftaran |
| `GET` | `/api/pendaftaran/:id` | Ya | Admin | Detail pendaftaran |

#### `POST /api/pendaftaran`

Request body:
```json
{
  "nama_lengkap": "Ahmad Fauzi",
  "nim": "2023001",
  "email": "ahmad@university.ac.id",
  "angkatan": "2023",
  "no_hp": "081234567890",
  "program_studi": "Teknik Informatika",
  "bidang_minat": "Kajian",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "2002-05-15",
  "jenis_kelamin": "L"
}
```

> **Flow:** Pendaftaran disimpan dengan `status_pendaftaran = 'pending'` lalu menunggu verifikasi admin.

---

### 3. Anggota & Verifikasi

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/anggota/verifikasi` | Ya | Admin | Approve/reject pendaftaran |
| `GET` | `/api/anggota` | Ya | Admin | Lihat semua anggota (dengan data pendaftaran) |
| `GET` | `/api/anggota/:id` | Ya | All | Detail anggota |

#### `POST /api/anggota/verifikasi`

Request body:
```json
{
  "id_pendaftaran": 1,
  "status": "approve"
}
```

> **Flow approve:**
> 1. Generate `no_anggota` otomatis: `RSL-2026-0001`
> 2. Buat akun anggota (username = NIM, password default = NIM)
> 3. Set `status_anggota = 'aktif'`
> 4. Kirim notifikasi ke anggota baru
>
> **Flow reject:**
> 1. Update `status_pendaftaran = 'ditolak'`

---

### 4. Kegiatan

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/kegiatan` | Ya | Admin | Buat kegiatan baru |
| `GET` | `/api/kegiatan` | Ya | All | Lihat semua kegiatan |
| `GET` | `/api/kegiatan/:id` | Ya | All | Detail kegiatan |
| `PUT` | `/api/kegiatan/:id` | Ya | Admin | Update kegiatan |
| `DELETE` | `/api/kegiatan/:id` | Ya | Admin | Hapus kegiatan |

#### `POST /api/kegiatan`

Request body:
```json
{
  "nama_kegiatan": "Kajian Rutin Mingguan",
  "jenis_kegiatan": "Kajian",
  "tanggal_kegiatan": "2026-04-25",
  "waktu_mulai": "19:00",
  "waktu_selesai": "21:00",
  "lokasi": "Masjid Al-Ikhlas Kampus",
  "deskripsi": "Kajian rutin membahas kitab Riyadhus Shalihin"
}
```

---

### 5. Presensi

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/presensi` | Ya | All | Catat presensi (+ upload foto) |
| `POST` | `/api/presensi/verifikasi` | Ya | Admin | Verifikasi presensi |
| `GET` | `/api/presensi/kegiatan/:id_kegiatan` | Ya | All | Presensi per kegiatan |
| `GET` | `/api/presensi/anggota/:id_anggota` | Ya | All | Riwayat presensi anggota |

#### `POST /api/presensi`

Request body (multipart/form-data):
```
id_anggota: 1
id_kegiatan: 1
keterangan: "Hadir tepat waktu"
latitude: -6.1753924
longitude: 106.8271528
bukti_foto: [FILE] (opsional, max 5MB, JPG/PNG/WebP)
```

> **Constraint:** Satu anggota hanya bisa presensi **1 kali** per kegiatan (UNIQUE constraint).

#### `POST /api/presensi/verifikasi`

Request body:
```json
{
  "id_kehadiran": 1,
  "status": "hadir"
}
```

Status: `hadir` | `tidak_hadir` | `izin`

---

### 6. Laporan

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| `GET` | `/api/laporan/kehadiran` | Ya | Admin | Laporan kehadiran (JOIN anggota+kegiatan) |
| `GET` | `/api/laporan/anggota` | Ya | Admin | Laporan data anggota |

#### `GET /api/laporan/kehadiran`

Query parameters (opsional):
```
?tanggal_dari=2026-01-01
&tanggal_sampai=2026-12-31
&id_kegiatan=1
```

---

### 7. Sync (PWA Offline-First)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/sync/push` | Ya | Push data offline dari client ke server |
| `GET` | `/api/sync/pull` | Ya | Pull data terbaru dari server ke client |

#### `POST /api/sync/push` — Client ke Server

Request body:
```json
{
  "pendaftaran": [{ "nama_lengkap": "Test", "nim": "123" }],
  "kehadiran": [{ "id_anggota": 1, "id_kegiatan": 2 }]
}
```

#### `GET /api/sync/pull?last_sync=2026-04-20T00:00:00` — Server ke Client

Response:
```json
{
  "success": true,
  "data": {
    "kegiatan": [],
    "kehadiran": [],
    "notifikasi": [],
    "synced_at": "2026-04-20T15:30:00.000Z"
  }
}
```

> **Conflict Resolution:** Last Write Wins (berdasarkan `updated_at`).
>
> **Sync Worker:** Background process berjalan setiap 30 detik, memproses `sync_queue` yang berstatus `pending`. Retry max 5x.

---

### 8. Notifikasi

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/api/notifikasi/:id_anggota` | Ya | Lihat notifikasi anggota |
| `PATCH` | `/api/notifikasi/read` | Ya | Tandai notifikasi sudah dibaca |

#### `PATCH /api/notifikasi/read`

Request body (mark satu):
```json
{
  "id_notifikasi": 1
}
```

Request body (mark semua):
```json
{}
```
> Jika `id_notifikasi` tidak dikirim, semua notifikasi user yang login akan ditandai sudah dibaca.

---

### 9. Device Token (PWA Push)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/device-token` | Ya | Simpan device token untuk push notification |

Request body:
```json
{
  "device_token": "fcm_token_or_web_push_subscription"
}
```

---

## Database Schema

6 tabel utama (SQLite / Turso):

| Tabel | Deskripsi |
|---|---|
| `pendaftaran` | Data calon anggota yang mendaftar |
| `anggota` | Anggota aktif (terverifikasi) + kredensial login |
| `kegiatan` | Daftar kegiatan/event UKM |
| `kehadiran` | Presensi anggota di kegiatan |
| `notifikasi` | Notifikasi in-app untuk anggota |
| `sync_queue` | Antrian sinkronisasi PWA offline-first |

### Relasi

```
pendaftaran  1 --> 1  anggota       (id_pendaftaran)
anggota      1 --> N  kehadiran     (id_anggota)
kegiatan     1 --> N  kehadiran     (id_kegiatan)
anggota      1 --> N  notifikasi    (id_anggota)
anggota      1 --> N  sync_queue    (id_anggota)
```

### Nomor Anggota

Format: `RSL-{TAHUN}-{SEQUENCE 4 digit}`

Contoh: `RSL-2026-0001`, `RSL-2026-0002`, ...

---

## Fitur Utama

### Autentikasi & Otorisasi
- JWT-based authentication
- Role-based access control (`admin` / `user`)
- Password hashing dengan bcryptjs (salt rounds: 12)

### Flow Pendaftaran ke Verifikasi
```
Calon mendaftar (POST /pendaftaran)
  -> status: pending
  -> Admin verifikasi (POST /anggota/verifikasi)
    -> approve: buat akun + generate no_anggota
    -> reject: status ditolak
```

### Flow Presensi ke Verifikasi
```
Anggota presensi (POST /presensi)
  -> sync_status: pending
  -> Admin verifikasi (POST /presensi/verifikasi)
    -> status: hadir / tidak_hadir / izin
    -> kirim notifikasi ke anggota
```

### PWA Offline-First
- **Push** — client mengirim data offline ke server
- **Pull** — client mengambil data terbaru berdasarkan `last_sync` timestamp
- **Sync Queue Worker** — background process (30 detik interval)
- **Conflict Resolution** — Last Write Wins

### Notifikasi
- In-app notification system
- Auto-trigger pada verifikasi pendaftaran & presensi
- Support `action_url` untuk deep linking
- Device token storage untuk PWA push notification

### Security & Best Practices
- Rate limiting (100 req / 15 menit per IP)
- CORS configurable
- Input validation dengan Zod
- Consistent error handling
- Structured logging (Pino)

---

## Default Admin

Saat pertama kali dijalankan, server otomatis membuat admin user:

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Role** | `admin` |
| **No. Anggota** | `RSL-2026-0000` |

> **Penting:** Ganti password admin setelah pertama kali login di production!

---

## License

Proyek ini dibuat untuk keperluan skripsi.

---

*Built with Bun + Express.js + TypeScript + Turso*
