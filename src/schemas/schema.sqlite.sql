-- =========================================
-- SQLite-adapted schema for be-sadam
-- Adapted from MySQL schema for Turso (libsql)
-- =========================================

-- =========================================
-- TABLE: PENDAFTARAN
-- =========================================
CREATE TABLE IF NOT EXISTS pendaftaran (
    id_pendaftaran INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_lengkap TEXT NOT NULL,
    nim TEXT UNIQUE,
    angkatan TEXT,
    no_hp TEXT,
    email TEXT UNIQUE,
    program_studi TEXT,
    bidang_minat TEXT,
    tempat_lahir TEXT,
    tanggal_lahir TEXT,
    jenis_kelamin TEXT CHECK(jenis_kelamin IN ('L', 'P')),
    tgl_pendaftaran TEXT DEFAULT (datetime('now', '+7 hours')),
    status_pendaftaran TEXT DEFAULT 'pending',
    bukti_pembayaran TEXT,
    tgl_pembayaran TEXT,

    created_at TEXT DEFAULT (datetime('now', '+7 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
);

-- =========================================
-- TABLE: ANGGOTA
-- =========================================
CREATE TABLE IF NOT EXISTS anggota (
    id_anggota INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pendaftaran INTEGER NOT NULL,
    no_anggota TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    tanggal_aktif TEXT,
    status_anggota TEXT DEFAULT 'aktif',
    last_sync TEXT,
    device_token TEXT,
    enable_notification INTEGER DEFAULT 1,
    foto_profil TEXT,

    created_at TEXT DEFAULT (datetime('now', '+7 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+7 hours')),

    FOREIGN KEY (id_pendaftaran) REFERENCES pendaftaran(id_pendaftaran)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================
-- TABLE: KEGIATAN
-- =========================================
CREATE TABLE IF NOT EXISTS kegiatan (
    id_kegiatan INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kegiatan TEXT NOT NULL,
    jenis_kegiatan TEXT,
    tanggal_kegiatan TEXT NOT NULL,
    waktu_mulai TEXT,
    waktu_selesai TEXT,
    lokasi TEXT,
    deskripsi TEXT,
    status_kegiatan TEXT DEFAULT 'aktif',
    pamflet TEXT,

    created_at TEXT DEFAULT (datetime('now', '+7 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
);

-- =========================================
-- TABLE: KEHADIRAN
-- =========================================
CREATE TABLE IF NOT EXISTS kehadiran (
    id_kehadiran INTEGER PRIMARY KEY AUTOINCREMENT,
    id_anggota INTEGER NOT NULL,
    id_kegiatan INTEGER NOT NULL,
    tgl_presensi TEXT NOT NULL,
    waktu_presensi TEXT DEFAULT (datetime('now', '+7 hours')),
    keterangan TEXT,
    bukti_foto TEXT,
    latitude REAL,
    longitude REAL,
    diverifikasi_oleh TEXT,
    sync_status TEXT DEFAULT 'pending',

    created_at TEXT DEFAULT (datetime('now', '+7 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+7 hours')),

    FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_kegiatan) REFERENCES kegiatan(id_kegiatan)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE (id_anggota, id_kegiatan)
);

-- =========================================
-- TABLE: NOTIFIKASI
-- =========================================
CREATE TABLE IF NOT EXISTS notifikasi (
    id_notifikasi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_anggota INTEGER NOT NULL,
    judul TEXT,
    pesan TEXT,
    tipe_notifikasi TEXT,
    terbaca INTEGER DEFAULT 0,
    read_at TEXT,
    action_url TEXT,

    created_at TEXT DEFAULT (datetime('now', '+7 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+7 hours')),

    FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================
-- TABLE: SYNC_QUEUE
-- =========================================
CREATE TABLE IF NOT EXISTS sync_queue (
    id_sync INTEGER PRIMARY KEY AUTOINCREMENT,
    id_anggota INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    operation TEXT CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
    data_payload TEXT,
    sync_status TEXT DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now', '+7 hours')),
    synced_at TEXT,

    FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================
-- INDEXING (PERFORMANCE)
-- =========================================
CREATE INDEX IF NOT EXISTS idx_anggota_pendaftaran ON anggota(id_pendaftaran);
CREATE INDEX IF NOT EXISTS idx_kehadiran_anggota ON kehadiran(id_anggota);
CREATE INDEX IF NOT EXISTS idx_kehadiran_kegiatan ON kehadiran(id_kegiatan);
CREATE INDEX IF NOT EXISTS idx_notifikasi_anggota ON notifikasi(id_anggota);
CREATE INDEX IF NOT EXISTS idx_sync_anggota ON sync_queue(id_anggota);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(sync_status);
