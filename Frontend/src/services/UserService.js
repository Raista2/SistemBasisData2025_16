import { apiClient } from '../context/AuthContext';

const UserService = {
    getUserProfile: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return response.data.payload;
        } catch (error) {
            console.error(`Error fetching user profile for user ${userId}:`, error);
            throw error;
        }
    },
    
    updateUserProfile: async (userId, userData) => {
        try {
            const response = await apiClient.put(`/users/${userId}`, userData);
            return response.data.payload;
        } catch (error) {
            console.error(`Error updating user profile for user ${userId}:`, error);
            throw error;
        }
    },
    
    changePassword: async (oldPassword, newPassword) => {
        try {
            const response = await apiClient.put('/users/password', { 
                oldPassword, 
                newPassword 
            });
            return response.data.success;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },
    
    getAllUsers: async () => {
        try {
            const response = await apiClient.get('/users');
            return response.data.payload;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }
};

export default UserService;