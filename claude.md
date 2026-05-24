Saya sedang membangun backend menggunakan Express.js untuk aplikasi manajemen keanggotaan dan presensi kegiatan berbasis mobile/PWA (Next.js PWA).

Saya SUDAH memiliki:

* Database MySQL (tabel: pendaftaran, anggota, kegiatan, kehadiran, notifikasi, sync_queue)
* ERD dan BPMN flow lengkap
* Struktur folder Express (MVC / modular)

Saya ingin kamu generate backend yang FULL dan PRODUCTION-READY berdasarkan flow berikut.

---

# 🎯 CORE SYSTEM (WAJIB)

## 1. AUTH SYSTEM (JWT)

* Endpoint:

  * POST /auth/login
  * POST /auth/register (optional dari pendaftaran)
* Gunakan JWT
* Middleware:

  * authMiddleware
  * roleMiddleware (admin / user)

---

## 2. PENDAFTARAN ANGGOTA (P1)

Endpoint:
POST /pendaftaran

Flow:

* Validasi (email & nim unique)
* Simpan ke tabel `pendaftaran`
* status_pendaftaran = 'pending'
* Insert ke sync_queue (operation = INSERT)
* Kirim notifikasi (insert ke tabel notifikasi)

---

## 3. VERIFIKASI & AKTIVASI (P2)

Endpoint:
POST /anggota/verifikasi

Flow:

* Input: id_pendaftaran + status (approve/reject)

Jika approve:

* Insert ke tabel anggota
* Generate no_anggota otomatis
* status_anggota = aktif

Jika reject:

* Update status_pendaftaran = ditolak

* Kirim notifikasi ke user

---

## 4. KEGIATAN (P3)

Endpoint:

* POST /kegiatan (admin only)
* GET /kegiatan

Flow:

* Simpan ke tabel kegiatan
* Insert ke sync_queue

---

## 5. PRESENSI (P4)

Endpoint:
POST /presensi

Flow:

* Input:

  * id_anggota
  * id_kegiatan
  * foto
  * latitude
  * longitude

* Simpan ke tabel kehadiran

* sync_status = 'pending'

* Tidak boleh double presensi (UNIQUE constraint)

* Insert ke sync_queue

---

## 6. VERIFIKASI PRESENSI (ADMIN)

Endpoint:
POST /presensi/verifikasi

Flow:

* Approve / Reject kehadiran
* Update status
* Update riwayat keaktifan anggota

---

## 7. MONITORING & LAPORAN (P5)

Endpoint:

* GET /laporan/kehadiran
* GET /laporan/anggota

Flow:

* JOIN:
  anggota + kegiatan + kehadiran
* Filter by tanggal / kegiatan

---

# 🔥 PWA OFFLINE-FIRST SYSTEM (WAJIB)

## 8. SYNC SYSTEM

### Endpoint:

POST /sync/push
GET  /sync/pull?last_sync=timestamp

---

### PUSH (Client → Server)

Request contoh:
{
"pendaftaran": [...],
"kehadiran": [...]
}

Flow:

* Loop semua data
* Insert/update ke DB
* Simpan ke sync_queue
* Return status per item

---

### PULL (Server → Client)

Flow:

* Ambil semua data yang updated_at > last_sync
* Return:

  * kegiatan
  * kehadiran
  * notifikasi

---

## 9. SYNC QUEUE WORKER

Buat service:
processSyncQueue()

Flow:

* Ambil data sync_status = pending
* Proses
* Update:

  * sync_status = success / failed
  * retry_count++

Gunakan:

* setInterval (simulasi background worker)

---

## 10. CONFLICT HANDLING

Gunakan:

* updated_at
* strategi: LAST WRITE WINS

---

## 11. STATUS SYNC

Gunakan enum:

* pending
* synced
* failed

---

# 🔔 NOTIFICATION SYSTEM

Endpoint:

* GET /notifikasi/:id_anggota
* PATCH /notifikasi/read

Flow:

* Trigger read_at otomatis
* Support action_url

---

# 📱 DEVICE TOKEN (PWA PUSH)

Endpoint:
POST /device-token

Flow:

* Simpan ke anggota.device_token

---

# ⚙️ BEST PRACTICE (WAJIB)

Gunakan:

* Struktur:
  routes/
  controllers/
  services/
  repositories/
  middleware/

* Clean Architecture

* Async/await

* Global error handler

* Response format konsisten:
  {
  success: true,
  message: "...",
  data: {}
  }

---

# 📁 OUTPUT YANG DIINGINKAN

Generate FULL CODE:

1. Struktur folder project
2. Route semua endpoint
3. Controller
4. Service layer (business logic)
5. Repository (query DB pakai mysql2 / drizzle / prisma)
6. Middleware auth & role
7. Sync worker (setInterval)
8. Contoh implementasi endpoint sync
9. Contoh login JWT
10. Contoh error handling

---

# 🔥 CATATAN PENTING

* Jangan hanya CRUD — harus mengikuti flow:
  pending → verifikasi → aktif
  presensi → verifikasi → valid

* Harus support PWA offline-first

* Harus scalable dan clean code

* Gunakan nama field sesuai schema

---

# 🚀 BONUS (JIKA BISA)

* Tambahkan rate limiting
* Logging (winston / pino)
* Validation (zod / joi)
* Environment config (.env)

---

Tujuan:
Saya ingin backend ini siap untuk:

* Production
* Skripsi
* Aplikasi mobile/PWA offline-first
