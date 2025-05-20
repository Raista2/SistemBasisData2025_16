const baseResponse = require('../utils/baseResponse.util');
const approvalLogRepository = require('../repositories/approval-log.repository');
const peminjamanRepository = require('../repositories/peminjaman.repository');

exports.getAllApprovalLogs = async (req, res) => {
    try {
        const approvalLogs = await approvalLogRepository.getAllApprovalLogs();
        return baseResponse(res, true, 200, 'Approval logs retrieved successfully', approvalLogs);
    } catch (error) {
        console.error('Get all approval logs error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.getApprovalLogsByPeminjaman = async (req, res) => {
    try {
        const { peminjamanId } = req.params;

        // Check if peminjaman exists
        const peminjaman = await peminjamanRepository.getPeminjamanById(peminjamanId);
        if (!peminjaman) {
            return baseResponse(res, false, 404, 'Peminjaman not found', null);
        }

        // Check if user is authorized to view this peminjaman's logs
        if (req.user.role !== 'admin' && req.user.id !== peminjaman.user_id) {
            return baseResponse(res, false, 403, 'Unauthorized to view this peminjaman', null);
        }

        const approvalLogs = await approvalLogRepository.getApprovalLogsByPeminjaman(peminjamanId);

        return baseResponse(res, true, 200, 'Approval logs retrieved successfully', approvalLogs);
    } catch (error) {
        console.error('Get approval logs by peminjaman error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};