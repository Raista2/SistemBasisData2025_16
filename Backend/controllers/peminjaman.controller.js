const baseResponse = require('../utils/baseResponse.util');
const peminjamanRepository = require('../repositories/peminjaman.repository');
const approvalLogRepository = require('../repositories/approval-log.repository');
const ruanganRepository = require('../repositories/ruangan.repository');

exports.getAllPeminjaman = async (req, res) => {
    try {
        const peminjamanList = await peminjamanRepository.getAllPeminjaman();
        return baseResponse(res, true, 200, 'Peminjaman retrieved successfully', peminjamanList);
    } catch (error) {
        console.error('Get all peminjaman error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getPeminjamanByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const peminjamanList = await peminjamanRepository.getPeminjamanByStatus(status);

        return baseResponse(res, true, 200, `Peminjaman with status ${status} retrieved successfully`, peminjamanList);
    } catch (error) {
        console.error('Get peminjaman by status error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getPeminjamanByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const peminjamanList = await peminjamanRepository.getPeminjamanByUser(userId);

        return baseResponse(res, true, 200, 'Peminjaman retrieved successfully', peminjamanList);
    } catch (error) {
        console.error('Get peminjaman by user error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getPeminjamanByRuangan = async (req, res) => {
    try {
        const { ruanganId } = req.params;
        const { tanggal } = req.query;

        let peminjamanList;
        if (tanggal) {
            peminjamanList = await peminjamanRepository.getPeminjamanByRuanganAndDate(ruanganId, tanggal);
        } else {
            peminjamanList = await peminjamanRepository.getPeminjamanByRuangan(ruanganId);
        }

        return baseResponse(res, true, 200, 'Peminjaman retrieved successfully', peminjamanList);
    } catch (error) {
        console.error('Get peminjaman by ruangan error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getPeminjamanById = async (req, res) => {
    try {
        const { id } = req.params;
        const peminjaman = await peminjamanRepository.getPeminjamanById(id);

        if (!peminjaman) {
            return baseResponse(res, false, 404, 'Peminjaman not found', null);
        }

        // Check if user is authorized to view this peminjaman
        if (req.user.role !== 'admin' && req.user.id !== peminjaman.user_id) {
            return baseResponse(res, false, 403, 'Unauthorized to view this peminjaman', null);
        }

        return baseResponse(res, true, 200, 'Peminjaman retrieved successfully', peminjaman);
    } catch (error) {
        console.error('Get peminjaman by id error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.createPeminjaman = async (req, res) => {
    try {
        const { ruangan_id, tanggal, waktu_mulai, waktu_selesai, keperluan, jumlah_peserta, catatan } = req.body;

        // Validate input
        if (!ruangan_id || !tanggal || !waktu_mulai || !waktu_selesai || !keperluan || !jumlah_peserta) {
            return baseResponse(res, false, 400, 'Required fields are missing', null);
        }

        // Get ruangan details to check capacity
        const ruangan = await ruanganRepository.getRuanganById(ruangan_id);
        if (!ruangan) {
            return baseResponse(res, false, 404, 'Ruangan not found', null);
        }

        // Check capacity
        if (jumlah_peserta > ruangan.kapasitas) {
            return baseResponse(res, false, 400, `Jumlah peserta exceeds room capacity (${ruangan.kapasitas})`, null);
        }

        // Check for scheduling conflicts
        const conflicts = await peminjamanRepository.checkForConflicts(ruangan_id, tanggal, waktu_mulai, waktu_selesai);
        if (conflicts.length > 0) {
            return baseResponse(res, false, 409, 'There is already a reservation for this room at the requested time', conflicts);
        }

        // Create peminjaman
        const newPeminjaman = await peminjamanRepository.createPeminjaman({
            user_id: req.user.id,
            ruangan_id,
            tanggal,
            waktu_mulai,
            waktu_selesai,
            keperluan,
            jumlah_peserta,
            catatan,
            status: 'pending'
        });

        return baseResponse(res, true, 201, 'Peminjaman created successfully', newPeminjaman);
    } catch (error) {
        console.error('Create peminjaman error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.updatePeminjamanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, catatan } = req.body;

        // Validate input
        if (!status || !['approved', 'rejected'].includes(status)) {
            return baseResponse(res, false, 400, 'Valid status (approved or rejected) is required', null);
        }

        // Check if peminjaman exists
        const existingPeminjaman = await peminjamanRepository.getPeminjamanById(id);
        if (!existingPeminjaman) {
            return baseResponse(res, false, 404, 'Peminjaman not found', null);
        }

        // Check if the status is already set
        if (existingPeminjaman.status === status) {
            return baseResponse(res, true, 200, `Peminjaman is already ${status}`, existingPeminjaman);
        }

        // Update peminjaman status
        const updatedPeminjaman = await peminjamanRepository.updatePeminjamanStatus(id, status);

        // Create approval log
        await approvalLogRepository.createApprovalLog({
            peminjaman_id: id,
            admin_id: req.user.id,
            status_sebelumnya: existingPeminjaman.status,
            status_baru: status,
            catatan
        });

        return baseResponse(res, true, 200, 'Peminjaman status updated successfully', updatedPeminjaman);
    } catch (error) {
        console.error('Update peminjaman status error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.deletePeminjaman = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if peminjaman exists
        const existingPeminjaman = await peminjamanRepository.getPeminjamanById(id);
        if (!existingPeminjaman) {
            return baseResponse(res, false, 404, 'Peminjaman not found', null);
        }

        // Check if user is authorized to delete this peminjaman
        if (req.user.role !== 'admin' && req.user.id !== existingPeminjaman.user_id) {
            return baseResponse(res, false, 403, 'Unauthorized to delete this peminjaman', null);
        }

        // Only allow cancellation if status is pending
        if (req.user.role !== 'admin' && existingPeminjaman.status !== 'pending') {
            return baseResponse(res, false, 400, 'Cannot cancel a peminjaman that has already been approved or rejected', null);
        }

        await peminjamanRepository.deletePeminjaman(id);

        return baseResponse(res, true, 200, 'Peminjaman deleted successfully', null);
    } catch (error) {
        console.error('Delete peminjaman error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};