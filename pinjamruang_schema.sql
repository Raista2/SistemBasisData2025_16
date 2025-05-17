-- Create Database (run this as postgres superuser)
CREATE DATABASE pinjamruang_db;

-- Connect to the database
\c pinjamruang_db

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buildings (Gedung) Table
CREATE TABLE gedung (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    lokasi VARCHAR(255),
    singkatan VARCHAR(20),
    jam_operasional VARCHAR(100),
    pengelola VARCHAR(100),
    posisi_peta_x DOUBLE PRECISION,
    posisi_peta_y DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms (Ruangan) Table
CREATE TABLE ruangan (
    id SERIAL PRIMARY KEY,
    gedung_id INTEGER REFERENCES gedung(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    lantai INTEGER NOT NULL,
    kapasitas INTEGER NOT NULL,
    luas DOUBLE PRECISION,
    tipe VARCHAR(50),
    fasilitas TEXT,
    url_gambar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reservations (Peminjaman) Table
CREATE TABLE peminjaman (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ruangan_id INTEGER REFERENCES ruangan(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    keperluan VARCHAR(255) NOT NULL,
    jumlah_peserta INTEGER NOT NULL,
    catatan TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (waktu_selesai > waktu_mulai)
);

-- Approval Logs Table
CREATE TABLE approval_log (
    id SERIAL PRIMARY KEY,
    peminjaman_id INTEGER REFERENCES peminjaman(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status_sebelumnya VARCHAR(20) NOT NULL,
    status_baru VARCHAR(20) NOT NULL,
    catatan TEXT,
    waktu_perubahan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_ruangan_gedung_id ON ruangan(gedung_id);
CREATE INDEX idx_peminjaman_user_id ON peminjaman(user_id);
CREATE INDEX idx_peminjaman_ruangan_id ON peminjaman(ruangan_id);
CREATE INDEX idx_peminjaman_status ON peminjaman(status);
CREATE INDEX idx_peminjaman_tanggal ON peminjaman(tanggal);
CREATE INDEX idx_approval_log_peminjaman_id ON approval_log(peminjaman_id);

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2b$10$0DHnX4.0Zn0XGcjTkONhqOG/HPgNZPH7Nj9sMFKI2YQuzGw7IMa6W', 'admin');

-- Insert sample buildings
INSERT INTO gedung (nama, lokasi, singkatan, jam_operasional, pengelola)
VALUES
    ('Gedung K', 'Fakultas Teknik UI', 'K', '07:00 - 17:00', 'Departemen Teknik Komputer'),
    ('Gedung S', 'Fakultas Teknik UI', 'S', '07:00 - 18:00', 'Departemen Teknik Elektro'),
    ('Gedung GK', 'Fakultas Teknik UI', 'GK', '07:00 - 20:00', 'Fakultas Teknik');

-- Insert sample rooms
INSERT INTO ruangan (gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas)
VALUES
    (1, 'Ruangan K-101', 1, 40, 60.5, 'Kelas', 'Proyektor, AC, Whiteboard'),
    (1, 'Ruangan K-201', 2, 30, 45.0, 'Kelas', 'Proyektor, AC, Whiteboard'),
    (1, 'Ruangan K-301', 3, 25, 40.0, 'Laboratorium', 'Komputer, AC, Whiteboard'),
    
    (2, 'Ruangan S-101', 1, 50, 75.0, 'Kelas', 'Proyektor, AC, Whiteboard, Sound System'),
    (2, 'Ruangan S-102', 1, 30, 50.0, 'Laboratorium', 'Komputer, AC, Whiteboard'),
    (2, 'Ruangan S-201', 2, 40, 65.0, 'Kelas', 'Proyektor, AC, Whiteboard'),
    
    (3, 'Ruangan GK-101', 1, 100, 150.0, 'Aula', 'Proyektor, AC, Sound System, Podium'),
    (3, 'Ruangan GK-201', 2, 50, 80.0, 'Seminar', 'Proyektor, AC, Whiteboard, Sound System'),
    (3, 'Ruangan GK-301', 3, 20, 35.0, 'Ruang Rapat', 'Proyektor, AC, Whiteboard, Video Conference');
