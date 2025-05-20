const db = require('../database/pg.database');

exports.getAllApprovalLogs = async () => {
    const result = await db.query(
        `SELECT al.*, 
      u.username AS admin_username, 
      p.keperluan AS peminjaman_keperluan,
      r.nama AS ruangan_nama,
      g.nama AS gedung_nama
    FROM approval_log al
    JOIN users u ON al.admin_id = u.id
    JOIN peminjaman p ON al.peminjaman_id = p.id
    JOIN ruangan r ON p.ruangan_id = r.id
    JOIN gedung g ON r.gedung_id = g.id
    ORDER BY al.waktu_perubahan DESC`
    );
    return result.rows;
};

exports.getApprovalLogsByPeminjaman = async (peminjamanId) => {
    const result = await db.query(
        `SELECT al.*, 
      u.username AS admin_username
    FROM approval_log al
    JOIN users u ON al.admin_id = u.id
    WHERE al.peminjaman_id = $1
    ORDER BY al.waktu_perubahan DESC`,
        [peminjamanId]
    );
    return result.rows;
};

exports.createApprovalLog = async (logData) => {
    const { peminjaman_id, admin_id, status_sebelumnya, status_baru, catatan } = logData;

    const result = await db.query(
        `INSERT INTO approval_log 
      (peminjaman_id, admin_id, status_sebelumnya, status_baru, catatan) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
        [peminjaman_id, admin_id, status_sebelumnya, status_baru, catatan]
    );

    return result.rows[0];
};