const db = require('../database/pg.database');

exports.getAllPeminjaman = async () => {
    const result = await db.query(
        `SELECT p.*, 
      u.username AS user_username, 
      r.nama AS ruangan_nama, 
      g.nama AS gedung_nama 
    FROM peminjaman p 
    JOIN users u ON p.user_id = u.id 
    JOIN ruangan r ON p.ruangan_id = r.id 
    JOIN gedung g ON r.gedung_id = g.id 
    ORDER BY p.tanggal DESC, p.waktu_mulai`
    );
    return result.rows;
};

exports.getPeminjamanById = async (id) => {
    const result = await db.query(
        `SELECT p.*, 
      u.username AS user_username, 
      r.nama AS ruangan_nama, 
      g.nama AS gedung_nama 
    FROM peminjaman p 
    JOIN users u ON p.user_id = u.id 
    JOIN ruangan r ON p.ruangan_id = r.id 
    JOIN gedung g ON r.gedung_id = g.id 
    WHERE p.id = $1`,
        [id]
    );
    return result.rows[0];
};

exports.getPeminjamanByStatus = async (status) => {
    const result = await db.query(
        `SELECT p.*, 
      u.username AS user_username, 
      r.nama AS ruangan_nama, 
      g.nama AS gedung_nama 
    FROM peminjaman p 
    JOIN users u ON p.user_id = u.id 
    JOIN ruangan r ON p.ruangan_id = r.id 
    JOIN gedung g ON r.gedung_id = g.id 
    WHERE p.status = $1 
    ORDER BY p.tanggal, p.waktu_mulai`,
        [status]
    );
    return result.rows;
};

exports.getPeminjamanByUser = async (userId) => {
    const result = await db.query(
        `SELECT p.*, 
      u.username AS user_username, 
      r.nama AS ruangan_nama, 
      g.nama AS gedung_nama 
    FROM peminjaman p 
    JOIN users u ON p.user_id = u.id 
    JOIN ruangan r ON p.ruangan_id = r.id 
    JOIN gedung g ON r.gedung_id = g.id 
    WHERE p.user_id = $1 
    ORDER BY p.tanggal DESC, p.waktu_mulai`,
        [userId]
    );
    return result.rows;
};

exports.getPeminjamanByRuangan = async (ruanganId) => {
    const result = await db.query(
        `SELECT p.*, 
      u.username AS user_username, 
      r.nama AS ruangan_nama, 
      g.nama AS gedung_nama 
    FROM peminjaman p 
    JOIN users u ON p.user_id = u.id 
    JOIN ruangan r ON p.ruangan_id = r.id 
    JOIN gedung g ON r.gedung_id = g.id 
    WHERE p.ruangan_id = $1 
    ORDER BY p.tanggal, p.waktu_mulai`,
        [ruanganId]
    );
    return result.rows;
};

exports.getPeminjamanByRuanganAndDate = async (ruanganId, tanggal) => {
    const result = await db.query(
        `SELECT p.*, 
      u.username AS user_username, 
      r.nama AS ruangan_nama, 
      g.nama AS gedung_nama 
    FROM peminjaman p 
    JOIN users u ON p.user_id = u.id 
    JOIN ruangan r ON p.ruangan_id = r.id 
    JOIN gedung g ON r.gedung_id = g.id 
    WHERE p.ruangan_id = $1 AND p.tanggal = $2 
    ORDER BY p.waktu_mulai`,
        [ruanganId, tanggal]
    );
    return result.rows;
};

exports.checkForConflicts = async (ruanganId, tanggal, waktuMulai, waktuSelesai) => {
    const result = await db.query(
        `SELECT * FROM peminjaman 
    WHERE ruangan_id = $1 
    AND tanggal = $2 
    AND status != 'rejected'
    AND (
      (waktu_mulai <= $3 AND waktu_selesai > $3) OR
      (waktu_mulai < $4 AND waktu_selesai >= $4) OR
      (waktu_mulai >= $3 AND waktu_selesai <= $4)
    )`,
        [ruanganId, tanggal, waktuMulai, waktuSelesai]
    );
    return result.rows;
};

exports.createPeminjaman = async (peminjamanData) => {
    const { user_id, ruangan_id, tanggal, waktu_mulai, waktu_selesai, keperluan, jumlah_peserta, catatan, status } = peminjamanData;

    const result = await db.query(
        `INSERT INTO peminjaman 
      (user_id, ruangan_id, tanggal, waktu_mulai, waktu_selesai, keperluan, jumlah_peserta, catatan, status) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
        [user_id, ruangan_id, tanggal, waktu_mulai, waktu_selesai, keperluan, jumlah_peserta, catatan, status]
    );

    return result.rows[0];
};

exports.updatePeminjamanStatus = async (id, status) => {
    const result = await db.query(
        'UPDATE peminjaman SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
    );

    return result.rows[0];
};

exports.deletePeminjaman = async (id) => {
    await db.query('DELETE FROM peminjaman WHERE id = $1', [id]);
    return true;
};