const baseResponse = require('../utils/baseResponse.util');
const ruanganRepository = require('../repositories/ruangan.repository');

exports.getAllRuangan = async (req, res) => {
    try {
        const ruanganList = await ruanganRepository.getAllRuangan();
        return baseResponse(res, true, 200, 'Ruangan retrieved successfully', ruanganList);
    } catch (error) {
        console.error('Get all ruangan error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getRuanganById = async (req, res) => {
    try {
        const { id } = req.params;
        const ruangan = await ruanganRepository.getRuanganById(id);

        if (!ruangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }

        return baseResponse(res, true, 200, 'Ruangan retrieved successfully', ruangan);
    } catch (error) {
        console.error('Get ruangan by id error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getRuanganByGedung = async (req, res) => {
    try {
        const { gedungId } = req.params;
        const ruanganList = await ruanganRepository.getRuanganByGedung(gedungId);

        return baseResponse(res, true, 200, 'Ruangan retrieved successfully', ruanganList);
    } catch (error) {
        console.error('Get ruangan by gedung error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.createRuangan = async (req, res) => {
    try {
        const { gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar } = req.body;

        // Validate input
        if (!gedung_id || !nama || !lantai || !kapasitas) {
            return baseResponse(res, false, 400, 'Gedung ID, nama, lantai, and kapasitas are required', null);
        }

        const newRuangan = await ruanganRepository.createRuangan({
            gedung_id,
            nama,
            lantai,
            kapasitas,
            luas,
            tipe,
            fasilitas,
            url_gambar
        });

        return baseResponse(res, true, 201, 'Ruangan created successfully', newRuangan);
    } catch (error) {
        console.error('Create ruangan error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.updateRuangan = async (req, res) => {
    try {
        const { id } = req.params;
        const { gedung_id, nama, lantai, kapasitas, luas, tipe, fasilitas, url_gambar } = req.body;

        // Validate input
        if (!gedung_id || !nama || !lantai || !kapasitas) {
            return baseResponse(res, false, 400, 'Gedung ID, nama, lantai, and kapasitas are required', null);
        }

        // Check if ruangan exists
        const existingRuangan = await ruanganRepository.getRuanganById(id);
        if (!existingRuangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }

        const updatedRuangan = await ruanganRepository.updateRuangan(id, {
            gedung_id,
            nama,
            lantai,
            kapasitas,
            luas,
            tipe,
            fasilitas,
            url_gambar
        });

        return baseResponse(res, true, 200, 'Ruangan updated successfully', updatedRuangan);
    } catch (error) {
        console.error('Update ruangan error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.deleteRuangan = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ruangan exists
        const existingRuangan = await ruanganRepository.getRuanganById(id);
        if (!existingRuangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }

        await ruanganRepository.deleteRuangan(id);

        return baseResponse(res, true, 200, 'Ruangan deleted successfully', null);
    } catch (error) {
        console.error('Delete ruangan error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};