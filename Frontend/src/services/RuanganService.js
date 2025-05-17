import { apiClient } from '../context/AuthContext';

const RuanganService = {
    getAllRuangan: async () => {
        try {
            const response = await apiClient.get('/ruangan');
            console.log('API Response:', response.data);
            
            // Using payload from baseResponse
            const rooms = response.data.payload || [];
            
            // Transform data to match frontend expectations
            return rooms.map(room => ({
                id: room.id,
                buildingId: room.gedung_id,
                name: room.nama,
                floor: room.lantai,
                capacity: room.kapasitas,
                size: room.luas,
                type: room.tipe,
                facilities: room.fasilitas,
                imageUrl: room.url_gambar,
                buildingName: room.gedung_nama // From SQL JOIN
            }));
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },
    
    getRuanganById: async (id) => {
        try {
            const response = await apiClient.get(`/ruangan/${id}`);
            const room = response.data.payload;
            
            if (!room) {
                throw new Error('Room not found');
            }
            
            // Transform data to match frontend expectations
            return {
                id: room.id,
                buildingId: room.gedung_id,
                name: room.nama,
                floor: room.lantai,
                capacity: room.kapasitas,
                size: room.luas,
                type: room.tipe,
                facilities: room.fasilitas,
                imageUrl: room.url_gambar,
                buildingName: room.gedung_nama // From SQL JOIN
            };
        } catch (error) {
            console.error(`Error fetching room with id ${id}:`, error);
            throw error;
        }
    },
    
    getRuanganByGedung: async (gedungId) => {
        try {
            const response = await apiClient.get(`/ruangan/gedung/${gedungId}`);
            console.log('API Response for rooms by building:', response.data);
            
            const rooms = response.data.payload || [];
            
            // Transform data to match frontend expectations
            return rooms.map(room => ({
                id: room.id,
                buildingId: room.gedung_id,
                name: room.nama,
                floor: room.lantai,
                capacity: room.kapasitas,
                size: room.luas,
                type: room.tipe,
                facilities: room.fasilitas,
                imageUrl: room.url_gambar,
                buildingName: room.gedung_nama // From SQL JOIN
            }));
        } catch (error) {
            console.error(`Error fetching rooms for building ${gedungId}:`, error);
            throw error;
        }
    },
    
    createRuangan: async (ruanganData) => {
        try {
            const response = await apiClient.post('/ruangan', ruanganData);
            return response.data.payload;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    },
    
    updateRuangan: async (id, ruanganData) => {
        try {
            const response = await apiClient.put(`/ruangan/${id}`, ruanganData);
            return response.data.payload;
        } catch (error) {
            console.error(`Error updating room with id ${id}:`, error);
            throw error;
        }
    },
    
    deleteRuangan: async (id) => {
        try {
            const response = await apiClient.delete(`/ruangan/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Error deleting room with id ${id}:`, error);
            throw error;
        }
    }
};

export default RuanganService;