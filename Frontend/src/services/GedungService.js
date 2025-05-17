import { apiClient } from '../context/AuthContext';

const GedungService = {
    getAllGedung: async () => {
        try {
            const response = await apiClient.get('/gedung');
            console.log('API Response:', response.data); // Untuk debugging
            
            // Menggunakan payload sesuai dengan baseResponse dari backend
            const buildings = response.data.payload || [];
            
            // Transform data to match frontend expectations
            return buildings.map(building => ({
                id: building.id,
                name: building.nama,
                location: building.lokasi,
                roomCount: building.jumlah_ruangan,
                operationHours: building.jam_operasional,
                singkatan: building.singkatan, 
                posisi_peta_x: building.posisi_peta_x, 
                posisi_peta_y: building.posisi_peta_y  
            }));
        } catch (error) {
            console.error('Error fetching buildings:', error);
            throw error;
        }
    },

    getGedungById: async (id) => {
        try {
            const response = await apiClient.get(`/gedung/${id}`);
            // Menggunakan payload sesuai dengan baseResponse dari backend
            return response.data.payload;
        } catch (error) {
            console.error(`Error fetching building with id ${id}:`, error);
            throw error;
        }
    }
};

export default GedungService;