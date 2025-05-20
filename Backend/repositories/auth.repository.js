const db = require('../database/pg.database');

exports.createUser = async (userData) => {
    const { username, email, password, role } = userData;

    const result = await db.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, password, role]
    );

    return result.rows[0];
};

exports.getUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

exports.getUserById = async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

exports.updateUser = async (id, userData) => {
    const { username, email } = userData;

    const result = await db.query(
        'UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [username, email, id]
    );

    return result.rows[0];
};

exports.deleteUser = async (id) => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
};