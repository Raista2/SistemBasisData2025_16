const baseResponse = require('../utils/baseResponse.util');
const ruanganRepository = require('../repositories/ruangan.repository');

exports.createRuangan = async (req, res) => {
    const { gedung_id, nama_ruangan, kapasitas, deskripsi } = req.body;
    if (!gedung_id || !nama_ruangan || !kapasitas) {
        return baseResponse(res, false, 400, 'Missing required fields', null);
    }

    try {
        const newRuangan = await ruanganRepository.createRuangan(req.body);
        baseResponse(res, true, 201, 'Ruangan created', newRuangan);
    } catch (error) {
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
};

exports.getAllRuangan = async (req, res) => {
    try {
        const ruangan = await ruanganRepository.getAllRuangan();
        baseResponse(res, true, 200, 'Success', ruangan);
    } catch (error) {
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
}

exports.getRuanganById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return baseResponse(res, false, 400, 'Missing required fields', null);
    }

    try {
        const ruangan = await ruanganRepository.getRuanganById(id);
        if (!ruangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }
        baseResponse(res, true, 200, 'Success', ruangan);
    } catch (error) {
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
};

exports.updateRuangan = async (req, res) => {
    const { id } = req.params;
    const { gedung_id, nama_ruangan, kapasitas, deskripsi } = req.body;
    if (!id || !gedung_id || !nama_ruangan || !kapasitas) {
        return baseResponse(res, false, 400, 'Missing required fields', null);
    }

    try {
        const updatedRuangan = await ruanganRepository.updateRuangan(id, req.body);
        if (!updatedRuangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }
        baseResponse(res, true, 200, 'Ruangan updated', updatedRuangan);
    } catch (error) {
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
}

exports.deleteRuangan = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return baseResponse(res, false, 400, 'Missing required fields', null);
    }

    try {
        const deletedRuangan = await ruanganRepository.deleteRuangan(id);
        if (!deletedRuangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }
        baseResponse(res, true, 200, 'Ruangan deleted', deletedRuangan);
    } catch (error) {
        baseResponse(res, false, 500, error.message || 'Server Error', null);
    }
};