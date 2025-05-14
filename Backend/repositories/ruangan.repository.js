// repositories/ruangan.repository.js
const db = require('../database/pg.database');

exports.createRuangan = async (ruangan) => {
    const result = await db.query(
        'INSERT INTO ruangan (gedung_id, nama_ruangan, kapasitas, deskripsi) VALUES ($1, $2, $3, $4) RETURNING *',
        [ruangan.gedung_id, ruangan.nama_ruangan, ruangan.kapasitas, ruangan.deskripsi]
    );
    return result.rows[0];
};

exports.getAllRuangan = async () => {
    const result = await db.query('SELECT * FROM ruangan');
    return result.rows;
}

exports.getRuanganById = async (id) => {
    const result = await db.query('SELECT * FROM ruangan WHERE id = $1', [id]);
    return result.rows[0];
};

exports.updateRuangan = async (id, ruangan) => {
    const result = await db.query(
        'UPDATE ruangan SET gedung_id = $1, nama_ruangan = $2, kapasitas = $3, deskripsi = $4 WHERE id = $5 RETURNING *',
        [ruangan.gedung_id, ruangan.nama_ruangan, ruangan.kapasitas, ruangan.deskripsi, id]
    );
    return result.rows[0];
};

exports.deleteRuangan = async (id) => {
    const result = await db.query('DELETE FROM ruangan WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
}
