const baseResponse = require('../utils/baseResponse.util');
const gedungRepository = require('../repositories/gedung.repository');

exports.getAllGedung = async (req, res) => {
    try {
        const gedungList = await gedungRepository.getAllGedung();
        return baseResponse(res, true, 200, 'Gedung retrieved successfully', gedungList);
    } catch (error) {
        console.error('Get all gedung error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getGedungById = async (req, res) => {
    try {
        const { id } = req.params;
        const gedung = await gedungRepository.getGedungById(id);

        if (!gedung) {
            return baseResponse(res, false, 404, 'Gedung not found', null);
        }

        return baseResponse(res, true, 200, 'Gedung retrieved successfully', gedung);
    } catch (error) {
        console.error('Get gedung by id error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.createGedung = async (req, res) => {
    try {
        const { nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y } = req.body;

        // Validate input
        if (!nama) {
            return baseResponse(res, false, 400, 'Nama gedung is required', null);
        }

        const newGedung = await gedungRepository.createGedung({
            nama,
            lokasi,
            singkatan,
            jam_operasional,
            pengelola,
            posisi_peta_x,
            posisi_peta_y
        });

        return baseResponse(res, true, 201, 'Gedung created successfully', newGedung);
    } catch (error) {
        console.error('Create gedung error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.updateGedung = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, lokasi, singkatan, jam_operasional, pengelola, posisi_peta_x, posisi_peta_y } = req.body;

        // Validate input
        if (!nama) {
            return baseResponse(res, false, 400, 'Nama gedung is required', null);
        }

        // Check if gedung exists
        const existingGedung = await gedungRepository.getGedungById(id);
        if (!existingGedung) {
            return baseResponse(res, false, 404, 'Gedung not found', null);
        }

        const updatedGedung = await gedungRepository.updateGedung(id, {
            nama,
            lokasi,
            singkatan,
            jam_operasional,
            pengelola,
            posisi_peta_x,
            posisi_peta_y
        });

        return baseResponse(res, true, 200, 'Gedung updated successfully', updatedGedung);
    } catch (error) {
        console.error('Update gedung error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.deleteGedung = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if gedung exists
        const existingGedung = await gedungRepository.getGedungById(id);
        if (!existingGedung) {
            return baseResponse(res, false, 404, 'Gedung not found', null);
        }

        await gedungRepository.deleteGedung(id);

        return baseResponse(res, true, 200, 'Gedung deleted successfully', null);
    } catch (error) {
        console.error('Delete gedung error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};