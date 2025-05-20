import { apiClient } from '../context/AuthContext';

const ApprovalLogService = {
    getAllApprovalLogs: async () => {
        try {
            const response = await apiClient.get('/approval-log');
            return transformApprovalLogList(response.data.payload || []);
        } catch (error) {
            console.error('Error fetching all approval logs:', error);
            throw error;
        }
    },
    
    getApprovalLogsByPeminjaman: async (peminjamanId) => {
        try {
            const response = await apiClient.get(`/approval-log/peminjaman/${peminjamanId}`);
            return transformApprovalLogList(response.data.payload || []);
        } catch (error) {
            console.error(`Error fetching approval logs for reservation ${peminjamanId}:`, error);
            throw error;
        }
    }
};

// Helper function to transform approval log data
const transformApprovalLog = (approvalLog) => {
    return {
        id: approvalLog.id,
        reservationId: approvalLog.peminjaman_id,
        adminId: approvalLog.admin_id,
        adminName: approvalLog.admin_username,
        previousStatus: approvalLog.status_sebelumnya,
        newStatus: approvalLog.status_baru,
        notes: approvalLog.catatan,
        timestamp: approvalLog.waktu_perubahan,
        // Additional data from JOINs
        reservationPurpose: approvalLog.peminjaman_keperluan,
        roomName: approvalLog.ruangan_nama,
        buildingName: approvalLog.gedung_nama
    };
};

// Helper function to transform array of approval log data
const transformApprovalLogList = (approvalLogList) => {
    return approvalLogList.map(log => transformApprovalLog(log));
};

export default ApprovalLogService;