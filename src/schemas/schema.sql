-- =========================================
-- DATABASE SETTING (optional)
-- =========================================
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

-- =========================================
-- TABLE: PENDAFTARAN
-- =========================================
CREATE TABLE pendaftaran (
    id_pendaftaran INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    nim VARCHAR(20) UNIQUE,
    angkatan VARCHAR(10),
    no_hp VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    program_studi VARCHAR(100),
    bidang_minat VARCHAR(100),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    jenis_kelamin ENUM('L', 'P'),
    tgl_pendaftaran DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_pendaftaran VARCHAR(50) DEFAULT 'pending',
    bukti_pembayaran VARCHAR(255),
    tgl_pembayaran DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- TABLE: ANGGOTA
-- =========================================
CREATE TABLE anggota (
    id_anggota INT AUTO_INCREMENT PRIMARY KEY,
    id_pendaftaran INT NOT NULL,
    no_anggota VARCHAR(50) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    tanggal_aktif DATE,
    status_anggota VARCHAR(50) DEFAULT 'aktif',
    last_sync DATETIME,
    device_token VARCHAR(255),
    enable_notification BOOLEAN DEFAULT TRUE,
    foto_profil VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_anggota_pendaftaran
        FOREIGN KEY (id_pendaftaran)
        REFERENCES pendaftaran(id_pendaftaran)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- TABLE: KEGIATAN
-- =========================================
CREATE TABLE kegiatan (
    id_kegiatan INT AUTO_INCREMENT PRIMARY KEY,
    nama_kegiatan VARCHAR(100) NOT NULL,
    jenis_kegiatan VARCHAR(50),
    tanggal_kegiatan DATE NOT NULL,
    waktu_mulai TIME,
    waktu_selesai TIME,
    lokasi VARCHAR(255),
    deskripsi TEXT,
    status_kegiatan VARCHAR(50) DEFAULT 'aktif',
    pamflet VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- TABLE: KEHADIRAN
-- =========================================
CREATE TABLE kehadiran (
    id_kehadiran INT AUTO_INCREMENT PRIMARY KEY,
    id_anggota INT NOT NULL,
    id_kegiatan INT NOT NULL,
    tgl_presensi DATE NOT NULL,
    waktu_presensi DATETIME DEFAULT CURRENT_TIMESTAMP,
    keterangan VARCHAR(255),
    bukti_foto VARCHAR(255),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    diverifikasi_oleh VARCHAR(100),
    sync_status VARCHAR(50) DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_kehadiran_anggota
        FOREIGN KEY (id_anggota)
        REFERENCES anggota(id_anggota)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_kehadiran_kegiatan
        FOREIGN KEY (id_kegiatan)
        REFERENCES kegiatan(id_kegiatan)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- 1 anggota tidak boleh absen 2x di kegiatan yang sama
    UNIQUE (id_anggota, id_kegiatan)
);

-- =========================================
-- TABLE: NOTIFIKASI
-- =========================================
CREATE TABLE notifikasi (
    id_notifikasi INT AUTO_INCREMENT PRIMARY KEY,
    id_anggota INT NOT NULL,
    judul VARCHAR(100),
    pesan TEXT,
    tipe_notifikasi VARCHAR(50),
    terbaca BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    action_url VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifikasi_anggota
        FOREIGN KEY (id_anggota)
        REFERENCES anggota(id_anggota)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- TABLE: SYNC_QUEUE
-- =========================================
CREATE TABLE sync_queue (
    id_sync INT AUTO_INCREMENT PRIMARY KEY,
    id_anggota INT NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    operation ENUM('INSERT', 'UPDATE', 'DELETE'),
    data_payload JSON,
    sync_status VARCHAR(50) DEFAULT 'pending',
    retry_count INT DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME,

    CONSTRAINT fk_sync_anggota
        FOREIGN KEY (id_anggota)
        REFERENCES anggota(id_anggota)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- INDEXING (PERFORMANCE)
-- =========================================
CREATE INDEX idx_anggota_pendaftaran ON anggota(id_pendaftaran);

CREATE INDEX idx_kehadiran_anggota ON kehadiran(id_anggota);
CREATE INDEX idx_kehadiran_kegiatan ON kehadiran(id_kegiatan);

CREATE INDEX idx_notifikasi_anggota ON notifikasi(id_anggota);

CREATE INDEX idx_sync_anggota ON sync_queue(id_anggota);
CREATE INDEX idx_sync_status ON sync_queue(sync_status);

-- =========================================
-- OPTIONAL: TRIGGER AUTO UPDATE read_at
-- =========================================
DELIMITER $$

CREATE TRIGGER trg_notifikasi_read
BEFORE UPDATE ON notifikasi
FOR EACH ROW
BEGIN
    IF NEW.terbaca = TRUE AND OLD.terbaca = FALSE THEN
        SET NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
END$$

DELIMITER ;