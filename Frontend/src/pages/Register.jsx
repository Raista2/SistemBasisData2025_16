import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgUI2 from '../assets/images/bg-ui-2.png';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminCode, setAdminCode] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Simple validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);

        try {
            // Pass isAdmin and adminCode to register function
            const result = await register(username, email, password, isAdmin, adminCode);
            
            if (!result.success) {
                setError(result.message);
            } else {
                // Redirect to login page on successful registration
                navigate('/login');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Full screen background */}
            <div 
                className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${bgUI2})`,
                }}
            />
            
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-30" />
            
            {/* Content container */}
            <div className="relative z-10 pt-16 flex justify-center items-center min-h-screen py-8">
                {/* Glassmorphism card */}
                <div className="w-full max-w-lg mx-4">
                    <div className="backdrop-blur-md bg-white/15 border border-white/20 rounded-2xl p-8 shadow-2xl hover:bg-white/20 transition-all duration-500 relative">
                        <h1 className="text-3xl font-[950] mb-8 text-white text-center drop-shadow-lg">
                            Daftar
                        </h1>

                        {error && (
                            <div className="backdrop-blur-sm bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-lg mb-6 shadow-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Username"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    minLength="6"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="confirmPassword">
                                    Konfirmasi Password
                                </label>
                                <input
                                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            {/* Admin Registration Section */}
                            <div className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <input
                                        type="checkbox"
                                        id="isAdmin"
                                        checked={isAdmin}
                                        onChange={(e) => setIsAdmin(e.target.checked)}
                                        className="w-4 h-4 text-primary-blue bg-white/20 border-white/30 rounded focus:ring-white/50 focus:ring-2 backdrop-blur-sm"
                                    />
                                    <label className="ml-3 text-white/90 font-medium drop-shadow" htmlFor="isAdmin">
                                        Daftar sebagai Admin
                                    </label>
                                </div>
                                
                                {isAdmin && (
                                    <div className="mt-4 animate-fade-in-down">
                                        <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="adminCode">
                                            Kode Registrasi Admin
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                            type="password"
                                            id="adminCode"
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value)}
                                            required={isAdmin}
                                            placeholder="Masukkan kode registrasi admin"
                                        />
                                        <p className="text-white/70 text-xs mt-2 drop-shadow">
                                            Kode ini diperlukan untuk mendaftar sebagai admin
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                className={`w-full backdrop-blur-sm bg-primary-blue/80 hover:bg-primary-blue/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                    loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                                }`}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Mendaftar...' : 'Daftar'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-white/80 text-sm drop-shadow">
                                Sudah memiliki akun?{' '}
                                <Link 
                                    to="/login" 
                                    className="text-primary-yellow hover:text-yellow-300 font-semibold transition-colors duration-300 drop-shadow hover:drop-shadow-lg"
                                >
                                    Masuk disini
                                </Link>
                            </p>
                        </div>

                        {/* Additional glass effect decorations */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-blue/10 rounded-full blur-2xl"></div>
                        <div className="absolute top-1/2 -left-6 w-16 h-16 bg-primary-yellow/10 rounded-full blur-lg"></div>
                    </div>
                </div>
            </div>

            {/* Additional CSS for animations */}
            <style jsx>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-down {
                    animation: fadeInDown 0.3s ease-out;
                }

                /* Custom checkbox styling for glassmorphism */
                input[type="checkbox"]:checked {
                    background-color: rgba(37, 99, 235, 0.8);
                    border-color: rgba(255, 255, 255, 0.5);
                }

                /* Enhanced focus states */
                input:focus {
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
                }

                /* Smooth transitions for all interactive elements */
                input, button, a {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </>
    );
};

export default Register;