const db = require('../database/pg.database');

exports.getAllRuangan = async () => {
    const result = await db.query(
        'SELECT r.*, g.nama AS gedung_nama FROM ruangan r JOIN gedung g ON r.gedung_id = g.id ORDER BY r.gedung_id, r.lantai, r.nama'
    );
    return result.rows;
};

exports.getRuanganById = async (id) => {
    const result = await db.query(
        'SELECT r.*, g.nama AS gedung_nama FROM ruangan r JOIN gedung g ON r.gedung_id = g.id WHERE r.id = $1',
        [id]
    );
    return result.rows[0];
};

exports.getRuanganByGedung = async (gedungId) => {
    const result = await db.query(
        'SELECT r.*, g.nama AS gedung_nama FROM ruangan r JOIN gedung g ON r.gedung_id = g.id WHERE r.gedung_id = $1 ORDER BY r.lantai, r.nama',
        [gedungId]
    );
    return result.rows;
};

exports.createRuangan = async (ruanganData) => {
    const { gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar } = ruanganData;

    const result = await db.query(
        'INSERT INTO ruangan (gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar]
    );

    return result.rows[0];
};

exports.updateRuangan = async (id, ruanganData) => {
    const { gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar } = ruanganData;

    const result = await db.query(
        'UPDATE ruangan SET gedung_id = $1, nama = $2, lantai = $3, kapasitas = $4, luas = $5, tipe = $6, fasilitas = $7, url_gambar = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
        [gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar, id]
    );

    return result.rows[0];
};

exports.deleteRuangan = async (id) => {
    await db.query('DELETE FROM ruangan WHERE id = $1', [id]);
    return true;
};