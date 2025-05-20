const db = require('../database/pg.database');

exports.getAllGedung = async () => {
    const result = await db.query(
        'SELECT g.*, (SELECT COUNT(*) FROM ruangan r WHERE r.gedung_id = g.id) AS jumlah_ruangan FROM gedung g ORDER BY g.nama'
    );
    return result.rows;
};

exports.getGedungById = async (id) => {
    const result = await db.query(
        'SELECT g.*, (SELECT COUNT(*) FROM ruangan r WHERE r.gedung_id = g.id) AS jumlah_ruangan FROM gedung g WHERE g.id = $1',
        [id]
    );
    return result.rows[0];
};

exports.createGedung = async (gedungData) => {
    const { nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y } = gedungData;

    const result = await db.query(
        'INSERT INTO gedung (nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y]
    );

    return result.rows[0];
};

exports.updateGedung = async (id, gedungData) => {
    const { nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y } = gedungData;

    const result = await db.query(
        'UPDATE gedung SET nama = $1, lokasi = $2, singkatan = $3, jam_operasional = $4, pengelola = $5, posisi_peta_x = $6, posisi_peta_y = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
        [nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y, id]
    );

    return result.rows[0];
};

exports.deleteGedung = async (id) => {
    await db.query('DELETE FROM gedung WHERE id = $1', [id]);
    return true;
};