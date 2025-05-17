import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const verifyToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
        try {
            const response = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
            setUser(response.data.payload);
            } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setLoading(false);
        } else {
        setLoading(false);
        }
    };
    
    verifyToken();
    }, []);

    const updateUserData = (updatedUserData) => {
        // Update state
        setUser(updatedUserData);

        // Update localStorage
        if (updatedUserData) {
            localStorage.setItem('fgoUser', JSON.stringify(updatedUserData));
        } else {
            localStorage.removeItem('fgoUser');
        }
    };

    const login = async (email, password) => {
    try {
        const response = await axios.post('/auth/login', { email, password });
        
        // Pastikan Anda mengakses struktur respons yang benar
        if (response.data.success) {
        const { token, user } = response.data.payload;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
        } else {
        return { success: false, message: response.data.message };
        }
    } catch (error) {
        return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
        };
    }
    };

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('fgoUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            updateUserData,
            loading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the axios instance for use in other components
export const apiClient = api;