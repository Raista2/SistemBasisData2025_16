import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create the Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios interceptors when auth state changes
    useEffect(() => {
        // Interceptor for adding auth token to requests
        const requestInterceptor = apiClient.interceptors.request.use(
            (config) => {
                if (user?.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor for handling auth-related responses
        const responseInterceptor = apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle 401 Unauthorized errors
                if (error.response?.status === 401) {
                    // Only logout if we have a user and we're not already on the login page
                    if (user && window.location.pathname !== '/login') {
                        console.log('Session expired. Logging out...');
                        logout();
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        // Clean up interceptors when component unmounts or user changes
        return () => {
            apiClient.interceptors.request.eject(requestInterceptor);
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [user]);

    // Load user from localStorage on initial render
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserData = async (userData) => {
        try {
            const response = await AuthService.updateUser(userData);

            if (response.success) {
                // Update user data in localStorage and state
                const updatedUser = { ...user, ...response.payload };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            return response;
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            // Use AuthService which now uses the apiClient from this file
            const response = await AuthService.login({ email, password });

            if (!response.success) {
                return { success: false, message: response.message };
            }

            // Store user data with token
            const userData = {
                ...response.payload.user,
                token: response.payload.token
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    // Modifikasi fungsi register di AuthContext.jsx
    const register = async (username, email, password, isAdmin = false, adminCode = '') => {
        try {
            const response = await AuthService.register({
                username,
                email,
                password,
                isAdmin,
                adminCode
            });
            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            setUser(null);

            window.location.href = '/';
        }
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

export default AuthContext;