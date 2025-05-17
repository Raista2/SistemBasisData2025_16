import { apiClient } from '../context/AuthContext';

const AuthService = {
    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data.payload;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw error;
        }
    }
};

export default AuthService;