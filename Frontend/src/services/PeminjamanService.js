import { apiClient } from '../context/AuthContext';

const PeminjamanService = {
    getAllPeminjaman: async () => {
        try {
            const response = await apiClient.get('/peminjaman');
            return transformPeminjamanList(response.data.payload || []);
        } catch (error) {
            console.error('Error fetching all reservations:', error);
            throw error;
        }
    },
    
    getPeminjamanById: async (id) => {
        try {
            const response = await apiClient.get(`/peminjaman/${id}`);
            return transformPeminjaman(response.data.payload);
        } catch (error) {
            console.error(`Error fetching reservation with id ${id}:`, error);
            throw error;
        }
    },
    
    getPeminjamanByStatus: async (status) => {
        try {
            const response = await apiClient.get(`/peminjaman/status/${status}`);
            return transformPeminjamanList(response.data.payload || []);
        } catch (error) {
            console.error(`Error fetching reservations with status ${status}:`, error);
            throw error;
        }
    },
    
    getPeminjamanByUser: async (userId) => {
        try {
            const response = await apiClient.get(`/peminjaman/user/${userId}`);
            return transformPeminjamanList(response.data.payload || []);
        } catch (error) {
            console.error(`Error fetching reservations for user ${userId}:`, error);
            throw error;
        }
    },
    
    getPeminjamanByRuangan: async (ruanganId, tanggal = null) => {
        try {
            let url = `/peminjaman/ruangan/${ruanganId}`;
            if (tanggal) {
                url += `?tanggal=${tanggal}`;
            }
            const response = await apiClient.get(url);
            return transformPeminjamanList(response.data.payload || []);
        } catch (error) {
            console.error(`Error fetching reservations for room ${ruanganId}:`, error);
            throw error;
        }
    },
    
    createPeminjaman: async (peminjamanData) => {
        try {
            const response = await apiClient.post('/peminjaman', peminjamanData);
            return transformPeminjaman(response.data.payload);
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        }
    },
    
    updatePeminjamanStatus: async (id, status, catatan) => {
        try {
            const response = await apiClient.put(`/peminjaman/${id}/status`, { status, catatan });
            return transformPeminjaman(response.data.payload);
        } catch (error) {
            console.error(`Error updating reservation status to ${status}:`, error);
            throw error;
        }
    },
    
    deletePeminjaman: async (id) => {
        try {
            const response = await apiClient.delete(`/peminjaman/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Error deleting reservation with id ${id}:`, error);
            throw error;
        }
    },
    
    checkConflicts: async (ruanganId, tanggal, waktuMulai, waktuSelesai) => {
        try {
            const response = await apiClient.get(`/peminjaman/ruangan/${ruanganId}?tanggal=${tanggal}`);
            const reservations = response.data.payload || [];
            
            // Check for conflicts manually
            return reservations.filter(reservation => {
                // Check if the new reservation overlaps with existing ones
                return (
                    (waktuMulai >= reservation.waktu_mulai && waktuMulai < reservation.waktu_selesai) ||
                    (waktuSelesai > reservation.waktu_mulai && waktuSelesai <= reservation.waktu_selesai) ||
                    (waktuMulai <= reservation.waktu_mulai && waktuSelesai >= reservation.waktu_selesai)
                );
            });
        } catch (error) {
            console.error('Error checking for conflicts:', error);
            throw error;
        }
    }
};

// Helper function to transform peminjaman data from backend to frontend format
const transformPeminjaman = (peminjaman) => {
    if (!peminjaman) return null;
    
    return {
        id: peminjaman.id,
        userId: peminjaman.user_id,
        userName: peminjaman.user_username,
        roomId: peminjaman.ruangan_id,
        roomName: peminjaman.ruangan_nama,
        buildingName: peminjaman.gedung_nama,
        date: peminjaman.tanggal,
        startTime: peminjaman.waktu_mulai,
        endTime: peminjaman.waktu_selesai,
        purpose: peminjaman.keperluan,
        attendees: peminjaman.jumlah_peserta,
        notes: peminjaman.catatan,
        status: peminjaman.status,
        createdAt: peminjaman.created_at,
        updatedAt: peminjaman.updated_at
    };
};

// Helper function to transform array of peminjaman data
const transformPeminjamanList = (peminjamanList) => {
    return peminjamanList.map(peminjaman => transformPeminjaman(peminjaman));
};

export default PeminjamanService;