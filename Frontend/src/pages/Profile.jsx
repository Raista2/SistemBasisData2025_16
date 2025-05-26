import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import bgUI from '../assets/images/bg-ui.png';

const Profile = () => {
    const { user, updateUserData } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [passwordChangeMode, setPasswordChangeMode] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const backgroundRef = useRef(null);

    // Parallax scroll handler
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
        };
        
        const throttle = (func, delay) => {
            let timeoutId;
            let lastExecTime = 0;
            return function (...args) {
                const currentTime = Date.now();
                
                if (currentTime - lastExecTime > delay) {
                    func.apply(this, args);
                    lastExecTime = currentTime;
                } else {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        func.apply(this, args);
                        lastExecTime = Date.now();
                    }, delay - (currentTime - lastExecTime));
                }
            };
        };

        const throttledScroll = throttle(handleScroll, 16);
        window.addEventListener('scroll', throttledScroll);
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', throttledScroll);
        };
    }, []);

    // Load user data
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/profile' } });
            return;
        }

        setUsername(user.username || '');
        setEmail(user.email || '');
    }, [user, navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await updateUserData({
                username,
                email
            });

            setSuccess('Profile updated successfully');
            setEditMode(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        setLoading(true);

        try {
            await updateUserData({
                currentPassword,
                newPassword
            });

            setSuccess('Password changed successfully');
            setPasswordChangeMode(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setUsername(user.username || '');
        setEmail(user.email || '');
        setEditMode(false);
        setError(null);
    };

    const cancelPasswordChange = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordChangeMode(false);
        setError(null);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    if (!user) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div 
                        className="relative mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"></div>
                    </motion.div>
                    <motion.p 
                        className="text-white font-medium text-lg"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Loading profile...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            {/* Refined CSS */}
            <style jsx>{`
                .glass-panel {
                    backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                
                .glass-button {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .glass-button:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .glass-input {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    transition: all 0.3s ease;
                }

                .glass-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.4);
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
                }

                .info-card {
                    backdrop-filter: blur(15px);
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    transition: all 0.3s ease;
                }

                .info-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.25);
                }

                .gradient-accent {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
                }

                .success-alert {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: rgb(16, 185, 129);
                }

                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: rgb(239, 68, 68);
                }
            `}</style>

            {/* Background */}
            <div 
                ref={backgroundRef}
                className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
                style={{ 
                    backgroundImage: `url(${bgUI})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    height: '120vh',
                    transform: `translateY(${-scrollY * 0.1}px)`,
                    filter: 'blur(1px) brightness(0.7)'
                }}
            />

            {/* Main Content */}
            <motion.div 
                className="relative z-10 pt-20 pb-8 min-h-screen"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <motion.div 
                            className="py-12 w-full mb-8 text-center"
                            variants={itemVariants}
                        >
                            <motion.div 
                                className="w-24 h-24 mx-auto mb-6 rounded-full gradient-accent flex items-center justify-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-[900] text-white mb-4 drop-shadow-lg">
                                User Profile
                            </h1>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto">
                                Manage your account information and security settings
                            </p>
                        </motion.div>

                        {/* Success/Error Alerts */}
                        <AnimatePresence>
                            {success && (
                                <motion.div 
                                    className="mb-8"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="glass-panel rounded-xl p-4 success-alert">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">{success}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div 
                                    className="mb-8"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="glass-panel rounded-xl p-4 error-alert">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">{error}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Account Information */}
                        <motion.div 
                            className="py-8 w-full mb-8"
                            variants={itemVariants}
                        >
                            <motion.div 
                                className="glass-panel rounded-2xl p-8"
                                variants={cardVariants}
                                whileHover={{ y: -2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center">
                                        <div className="p-3 gradient-accent rounded-xl mr-4">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Account Information</h2>
                                            <p className="text-white/60">Manage your personal details</p>
                                        </div>
                                    </div>
                                    {!editMode && (
                                        <motion.button
                                            onClick={() => setEditMode(true)}
                                            className="glass-button text-white px-6 py-2 rounded-lg font-medium flex items-center"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </motion.button>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {editMode ? (
                                        <motion.form 
                                            onSubmit={handleProfileUpdate} 
                                            className="space-y-6"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-white font-medium mb-3" htmlFor="username">
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none"
                                                        id="username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                        placeholder="Enter your username"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-white font-medium mb-3" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none"
                                                        id="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        placeholder="Enter your email"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-4 pt-4">
                                                <motion.button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="glass-button text-white px-6 py-2 rounded-lg font-medium"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    Cancel
                                                </motion.button>
                                                <motion.button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="gradient-accent text-white px-8 py-2 rounded-lg font-medium disabled:opacity-70"
                                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                                >
                                                    {loading ? (
                                                        <motion.div 
                                                            className="flex items-center"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                        >
                                                            <motion.div 
                                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            />
                                                            Saving...
                                                        </motion.div>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </motion.button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.div 
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {[
                                                { label: 'Username', value: user.username, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                                { label: 'Email', value: user.email, icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                                { label: 'Role', value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                                                { 
                                                    label: 'Member Since', 
                                                    value: (user.createdAt || user.created_at) ? new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
                                                    icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-6 0V7'
                                                },
                                                { 
                                                    label: 'Last Updated', 
                                                    value: (user.updatedAt || user.updated_at) ? new Date(user.updatedAt || user.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                                                    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                                }
                                            ].map((item, index) => (
                                                <motion.div 
                                                    key={index} 
                                                    className="info-card rounded-xl p-4"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                                    whileHover={{ y: -2 }}
                                                >
                                                    <div className="flex items-center mb-3">
                                                        <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center mr-3">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                                            </svg>
                                                        </div>
                                                        <p className="text-white/60 text-sm font-medium">{item.label}</p>
                                                    </div>
                                                    <p className="text-white font-semibold">{item.value}</p>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>

                        {/* Security Section */}
                        <motion.div 
                            className="py-8 w-full mb-8"
                            variants={itemVariants}
                        >
                            <motion.div 
                                className="glass-panel rounded-2xl p-8"
                                variants={cardVariants}
                                whileHover={{ y: -2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center">
                                        <div className="p-3 gradient-accent rounded-xl mr-4">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Security</h2>
                                            <p className="text-white/60">Manage your password and security settings</p>
                                        </div>
                                    </div>
                                    {!passwordChangeMode && (
                                        <motion.button
                                            onClick={() => setPasswordChangeMode(true)}
                                            className="glass-button text-white px-6 py-2 rounded-lg font-medium flex items-center"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                            Change Password
                                        </motion.button>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {passwordChangeMode ? (
                                        <motion.form 
                                            onSubmit={handlePasswordChange} 
                                            className="space-y-6"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div>
                                                <label className="block text-white font-medium mb-3" htmlFor="currentPassword">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none"
                                                    id="currentPassword"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-white font-medium mb-3" htmlFor="newPassword">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none"
                                                        id="newPassword"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        required
                                                        minLength="6"
                                                        placeholder="Enter new password"
                                                    />
                                                    <p className="text-white/50 text-sm mt-2">Minimum 6 characters</p>
                                                </div>

                                                <div>
                                                    <label className="block text-white font-medium mb-3" htmlFor="confirmPassword">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none"
                                                        id="confirmPassword"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-4 pt-4">
                                                <motion.button
                                                    type="button"
                                                    onClick={cancelPasswordChange}
                                                    className="glass-button text-white px-6 py-2 rounded-lg font-medium"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    Cancel
                                                </motion.button>
                                                <motion.button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="gradient-accent text-white px-8 py-2 rounded-lg font-medium disabled:opacity-70"
                                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                                >
                                                    {loading ? (
                                                        <motion.div 
                                                            className="flex items-center"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                        >
                                                            <motion.div 
                                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            />
                                                            Saving...
                                                        </motion.div>
                                                    ) : (
                                                        'Change Password'
                                                    )}
                                                </motion.button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.div 
                                            className="text-center"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="inline-flex items-center px-6 py-3 rounded-xl info-card">
                                                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <span className="text-white font-medium">
                                                    Password last changed: {user.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString('en-US') : 'Not available'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>

                        {/* Activity Stats */}
                        <motion.div 
                            className="py-8 w-full"
                            variants={itemVariants}
                        >
                            <motion.div 
                                className="glass-panel rounded-2xl p-8"
                                variants={cardVariants}
                                whileHover={{ y: -2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="flex items-center mb-8">
                                    <div className="p-3 gradient-accent rounded-xl mr-4">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Account Activity</h2>
                                        <p className="text-white/60">Your reservation statistics</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div 
                                        className="info-card rounded-xl p-6"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1, duration: 0.3 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="gradient-accent w-12 h-12 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-white">{user.totalReservations || 0}</p>
                                                <p className="text-white/60 text-sm font-medium">Total Reservations</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => navigate('/my-reservations')}
                                            className="w-full glass-button text-white py-2 rounded-lg font-medium flex items-center justify-center"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            View All Reservations
                                        </motion.button>
                                    </motion.div>

                                    <motion.div 
                                        className="info-card rounded-xl p-6"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="gradient-accent w-12 h-12 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-white">{user.approvedReservations || 0}</p>
                                                <p className="text-white/60 text-sm font-medium">Approved Reservations</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => navigate('/my-reservations?status=approved')}
                                            className="w-full glass-button text-white py-2 rounded-lg font-medium flex items-center justify-center"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            View Approved
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Profile;